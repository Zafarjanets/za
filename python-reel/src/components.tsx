import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from './theme';
import {FPS, timeline} from './timeline';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Spring that starts at `delay` frames; 0 -> 1 with a little overshoot.
export const usePop = (delay = 0, damping = 12) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, mass: 0.6}});
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const blob = (x: number, y: number, size: number, color: string) => (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: 'blur(140px)',
        opacity: 0.45,
      }}
    />
  );
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, ${C.bg2} 0%, ${C.bg} 60%)`}}>
      {blob(250 + Math.sin(t * 0.6) * 120, 450 + Math.cos(t * 0.5) * 140, 700, C.blue)}
      {blob(850 + Math.cos(t * 0.5) * 120, 1350 + Math.sin(t * 0.7) * 160, 650, '#b8930f')}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.035) 2px, transparent 2px)',
          backgroundSize: '90px 90px',
          backgroundPosition: `0 ${(frame * 0.6) % 90}px`,
          maskImage: 'radial-gradient(circle at 50% 45%, black 20%, transparent 75%)',
        }}
      />
    </AbsoluteFill>
  );
};

const SNAKE =
  'M50 5C34 5 29 12 29 20V30H52V34H19C10 34 5 41 5 52C5 63 10 70 19 70H27V59C27 51 33 46 41 46H60C67 46 72 41 72 34V20C72 12 65 5 50 5Z';

export const PythonLogo: React.FC<{size: number; spin?: number}> = ({size, spin = 0}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${spin}deg)`}}>
    <defs>
      <linearGradient id="pyb" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.blueLight} />
        <stop offset="1" stopColor={C.blue} />
      </linearGradient>
      <linearGradient id="pyy" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFE873" />
        <stop offset="1" stopColor={C.yellow} />
      </linearGradient>
    </defs>
    <path d={SNAKE} fill="url(#pyb)" />
    <circle cx="39" cy="14" r="3.6" fill="#fff" />
    <g transform="rotate(180 50 50)">
      <path d={SNAKE} fill="url(#pyy)" />
      <circle cx="39" cy="14" r="3.6" fill="#fff" />
    </g>
  </svg>
);

// Fades/slides a scene in and out at its edges.
export const SceneWrap: React.FC<{duration: number; children: React.ReactNode}> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, 9], [0, 1], clamp);
  const outP = interpolate(frame, [duration - 7, duration], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: inP * (1 - outP),
        transform: `translateY(${(1 - inP) * 60 - outP * 60}px) scale(${1 + outP * 0.04})`,
        filter: `blur(${(1 - inP) * 12 + outP * 12}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const Title: React.FC<{children: React.ReactNode; size?: number; delay?: number}> = ({
  children,
  size = 96,
  delay = 0,
}) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.08,
        color: C.text,
        textAlign: 'center',
        letterSpacing: -2,
        opacity: Math.min(p * 1.5, 1),
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const Accent: React.FC<{children: React.ReactNode; color?: string}> = ({
  children,
  color = C.yellow,
}) => <span style={{color}}>{children}</span>;

// Word-by-word captions: shows the current chunk, highlights the spoken word.
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chunks: {words: typeof timeline.scenes[0]['words']; start: number; end: number}[] = [];
  for (const s of timeline.scenes) {
    let cur: typeof s.words = [];
    s.words.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.text).join(' ').length;
      const boundary = /[,.?!—»]$/.test(w.text);
      if (cur.length >= 3 || len > 16 || boundary || i === s.words.length - 1) {
        chunks.push({words: cur, start: cur[0].start, end: w.end});
        cur = [];
      }
    });
  }
  const idx = chunks.findIndex((c, i) => t >= c.start - 0.05 && t < (chunks[i + 1]?.start ?? c.end + 0.6) - 0.05);
  if (idx < 0) return null;
  const chunk = chunks[idx];
  if (t > chunk.end + 0.6) return null;
  const local = frame - Math.round(chunk.start * FPS);
  const enter = spring({frame: local, fps: FPS, config: {damping: 14, mass: 0.5}});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 360}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 22px',
          maxWidth: 940,
          transform: `scale(${0.85 + enter * 0.15})`,
          opacity: enter,
        }}
      >
        {chunk.words.map((w, i) => {
          const active = t >= w.start - 0.03;
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 78,
                textTransform: 'uppercase',
                color: active ? C.yellow : C.text,
                textShadow: '0 6px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)',
                WebkitTextStroke: '3px rgba(0,0,0,0.6)',
                paintOrder: 'stroke fill',
              }}
            >
              {w.text.replace(/[—«»]/g, '').replace(/[,.]$/, '')}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const p = frame / timeline.durationInFrames;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: `${p * 100}%`,
      background: `linear-gradient(90deg, ${C.blue}, ${C.yellow})`}} />
  );
};
