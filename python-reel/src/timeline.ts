import data from './timeline.json';

export type Word = {text: string; start: number; end: number};
export type Item = {word: string; label: string; at: number; icon?: string; color?: string};
export type Scene = {
  id: string;
  start: number;
  end: number;
  voiceStart: number;
  words: Word[];
  items?: Item[];
};

export const timeline = data as {fps: number; durationInFrames: number; scenes: Scene[]};
export const FPS = timeline.fps;

export const sceneById = (id: string): Scene => {
  const s = timeline.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`no scene ${id}`);
  return s;
};

// Frame (relative to the scene start) at which the first word starting with `prefix` is spoken.
export const wordFrame = (scene: Scene, prefix: string): number => {
  const w = scene.words.find((x) => x.text.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!w) throw new Error(`no word ${prefix} in ${scene.id}`);
  return Math.round((w.start - scene.start) * FPS);
};
