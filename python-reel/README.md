# Python Reel

Вертикальный ролик 1080×1920 (~37 сек) «Что такое Python», собранный кодом на Remotion.

Готовое видео: `out/python-reel.mp4`.

## Как пересобрать

```bash
sudo apt install rhvoice rhvoice-russian ffmpeg   # голос (офлайн)
npm install
npm run audio    # озвучка, музыка, звуки, тайминги слов → public/audio.wav, src/timeline.json
npm run render   # видео → out/python-reel.mp4
```

Текст меняется в `script.json`: `text` — что видно в субтитрах, `say` — как произносить
(например, `Python` → `Пайтон`). Сцены и анимации — в `src/scenes.tsx`.
