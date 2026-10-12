"""Builds the audio side of the reel from script.json.

Outputs:
  public/audio.wav   - voice + music bed + sfx, mixed and ducked
  src/timeline.json  - scene frames and per-word timings for the video
"""
import json
import re
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
FPS = 30
LEAD_IN = 0.5
TAIL = 1.6
VOWELS = set("аеёиоуыэюяaeiouy")


def tts(text, voice, rate, out):
    raw = out.with_suffix(".raw.wav")
    subprocess.run(["RHVoice-test", "-p", voice, "-r", str(rate), "-o", str(raw)],
                   input=text.encode(), check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
                    "-ac", "1", "-ar", str(SR), str(out)], check=True)
    with wave.open(str(out)) as w:
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    return data.astype(np.float32) / 32768.0


def envelope(x, win=0.02):
    n = int(SR * win)
    pad = len(x) % n
    x = np.pad(np.abs(x), (0, n - pad if pad else 0))
    return x.reshape(-1, n).max(axis=1), n


def trim(x, thr=0.02):
    env, n = envelope(x)
    on = np.where(env > thr)[0]
    a = max(on[0] * n - int(0.03 * SR), 0)
    b = min((on[-1] + 1) * n + int(0.06 * SR), len(x))
    return x[a:b]


def speech_runs(x, thr=0.02, min_gap=0.12):
    """Voiced segments in seconds, merging gaps shorter than min_gap."""
    env, n = envelope(x)
    on = env > thr
    runs, start = [], None
    for i, v in enumerate(on):
        if v and start is None:
            start = i
        if not v and start is not None:
            runs.append([start * n / SR, i * n / SR])
            start = None
    if start is not None:
        runs.append([start * n / SR, len(on) * n / SR])
    merged = [runs[0]]
    for a, b in runs[1:]:
        if a - merged[-1][1] < min_gap:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    return merged


def tokens(text):
    out = []
    for t in text.split():
        if re.search(r"\w", t) or not out:
            out.append(t)
        else:
            out[-1] += " " + t
    return out


def weight(spoken):
    v = sum(c in VOWELS for c in spoken.lower())
    return max(v, 1) + 0.15 * len(re.sub(r"\W", "", spoken))


def word_timings(shown, spoken, x):
    """Distribute words over the voiced runs; phrases split on punctuation."""
    dur = len(x) / SR
    runs = speech_runs(x)
    phrases, cur = [], []
    for i, w in enumerate(shown):
        cur.append(i)
        if re.search(r"[,.?!:;—»]$", w) and i < len(shown) - 1:
            phrases.append(cur)
            cur = []
    if cur:
        phrases.append(cur)

    if len(runs) != len(phrases):
        runs = [[runs[0][0], runs[-1][1]]] if runs else [[0, dur]]
        phrases = [list(range(len(shown)))]

    times = [None] * len(shown)
    for (a, b), idx in zip(runs, phrases):
        ws = [weight(spoken[i]) for i in idx]
        total, t = sum(ws), a
        for i, wgt in zip(idx, ws):
            step = (b - a) * wgt / total
            times[i] = (t, t + step)
            t += step
    return times


# --- music and sfx -------------------------------------------------------

def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def music_bed(total):
    rng = np.random.default_rng(7)
    n = int(total * SR)
    t = np.arange(n) / SR
    out = np.zeros(n, dtype=np.float32)
    bpm = 100
    beat = 60 / bpm
    bar = beat * 4
    chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]

    # soft pad, one chord per bar
    k = 0
    while k * bar < total:
        a, b = int(k * bar * SR), min(int((k + 1) * bar * SR), n)
        seg = t[a:b] - k * bar
        env = np.minimum(seg / 0.4, 1) * np.minimum((bar - seg) / 0.4, 1)
        for m in chords[k % 4]:
            f = note(m)
            for det in (-0.12, 0.12):
                ff = f * 2 ** (det / 12)
                out[a:b] += 0.05 * env * (np.sin(2 * np.pi * ff * seg)
                                          + 0.3 * np.sin(4 * np.pi * ff * seg))
        root = note(chords[k % 4][0] - 24)
        out[a:b] += 0.16 * env * np.sin(2 * np.pi * root * seg)
        k += 1

    # drums
    kick_len = int(0.35 * SR)
    kt = np.arange(kick_len) / SR
    kick = np.sin(2 * np.pi * (45 * kt + 70 * (1 - np.exp(-kt * 30)) / 30)) * np.exp(-kt * 9)
    hat_len = int(0.05 * SR)
    hat = rng.standard_normal(hat_len) * np.exp(-np.arange(hat_len) / SR * 90)
    hat = np.diff(hat, prepend=0)
    clap_len = int(0.18 * SR)
    clap = rng.standard_normal(clap_len) * np.exp(-np.arange(clap_len) / SR * 22)
    clap = np.diff(clap, prepend=0) * 0.5

    def put(sample, at, gain):
        i = int(at * SR)
        j = min(i + len(sample), n)
        if i < n:
            out[i:j] += gain * sample[: j - i]

    steps = int(total / (beat / 2))
    for s in range(steps):
        at = s * beat / 2
        if at < bar:  # first bar: pad only, let the hook breathe
            continue
        if s % 8 in (0, 3, 4):
            put(kick, at, 0.55)
        if s % 8 in (2, 6):
            put(clap, at, 0.22)
        put(hat, at, 0.10 if s % 2 else 0.06)
    return out


def whoosh(dur=0.45):
    rng = np.random.default_rng(1)
    m = int(dur * SR)
    noise = rng.standard_normal(m)
    spec = np.fft.rfft(noise)
    freqs = np.fft.rfftfreq(m, 1 / SR)
    spec *= np.exp(-((np.log(freqs + 1) - np.log(2500)) ** 2) / 1.2)
    x = np.fft.irfft(spec, m)
    x /= np.abs(x).max()
    tt = np.arange(m) / m
    return x * np.sin(np.pi * tt) ** 2


def pop():
    m = int(0.09 * SR)
    tt = np.arange(m) / SR
    f = 700 + 900 * tt / tt[-1]
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 40)


def ding():
    m = int(1.2 * SR)
    tt = np.arange(m) / SR
    x = sum(np.sin(2 * np.pi * note(p) * tt) * g for p, g in ((76, 1), (83, 0.6), (88, 0.4)))
    return x * np.exp(-tt * 3.5) / 2


def main():
    script = json.loads((ROOT / "script.json").read_text())
    tmp = Path(tempfile.mkdtemp())
    scenes, clips, cursor = [], [], LEAD_IN
    for i, sc in enumerate(script["scenes"]):
        shown = tokens(sc["text"])
        spoken = [" ".join(sc["say"].get(p, p) for p in w.split()) for w in shown]
        x = trim(tts(" ".join(spoken), script["voice"], script["rate"], tmp / f"{i}.wav"))
        times = word_timings(shown, spoken, x)
        dur = len(x) / SR
        gap = script["gapAfter"] + (TAIL if i == len(script["scenes"]) - 1 else 0)
        start = cursor if i else 0.0
        voice_at = cursor
        end = cursor + dur + gap
        words = [{"text": w, "start": round(voice_at + a, 3), "end": round(voice_at + b, 3)}
                 for w, (a, b) in zip(shown, times)]
        entry = {"id": sc["id"], "start": round(start, 3), "end": round(end, 3),
                 "voiceStart": round(voice_at, 3), "words": words}
        if "items" in sc:
            entry["items"] = []
            for it in sc["items"]:
                w = next(w for w in words if w["text"] == it["word"])
                entry["items"].append({**it, "at": w["start"]})
        scenes.append(entry)
        clips.append((voice_at, x))
        cursor = end

    total = cursor
    n = int(total * SR)
    voice = np.zeros(n, dtype=np.float32)
    for at, x in clips:
        i = int(at * SR)
        voice[i:i + len(x)] += x
    voice /= np.abs(voice).max() / 0.9

    # duck music under speech
    env, blk = envelope(voice, 0.05)
    env = np.convolve((env > 0.03).astype(float), np.ones(6) / 6, mode="same")
    duck = np.repeat(1 - 0.55 * env, blk)[:n]
    music = music_bed(total) * duck * 0.55
    fade = int(1.2 * SR)
    music[-fade:] *= np.linspace(1, 0, fade)

    sfx = np.zeros(n, dtype=np.float32)

    def put(sample, at, gain):
        i = int(at * SR)
        j = min(i + len(sample), n)
        sfx[i:j] += gain * sample[: j - i]

    w = whoosh()
    for sc in scenes[1:]:
        put(w, sc["start"] - 0.2, 0.22)
    for sc in scenes:
        for it in sc.get("items", []):
            put(pop(), it["at"], 0.25)
    put(ding(), scenes[-1]["words"][-1]["start"], 0.3)

    mix = voice + music + sfx
    mix /= max(np.abs(mix).max() / 0.95, 1)
    pcm = (mix * 32767).astype(np.int16)

    (ROOT / "public").mkdir(exist_ok=True)
    with wave.open(str(ROOT / "public" / "audio.wav"), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(pcm.tobytes())

    timeline = {"fps": FPS, "durationInFrames": int(np.ceil(total * FPS)), "scenes": scenes}
    (ROOT / "src" / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    print(f"total {total:.2f}s")
    for sc in scenes:
        print(f"{sc['id']:8} {sc['start']:6.2f} -> {sc['end']:6.2f}")


if __name__ == "__main__":
    main()
