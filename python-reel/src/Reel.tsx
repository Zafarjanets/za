import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background, Captions, ProgressBar, SceneWrap} from './components';
import {Cta, History, Hook, Name, Popular, Simple, Uses, Who} from './scenes';
import {FPS, timeline} from './timeline';

const SCENES: Record<string, React.FC> = {
  hook: Hook,
  popular: Popular,
  history: History,
  name: Name,
  simple: Simple,
  uses: Uses,
  who: Who,
  cta: Cta,
};

export const Reel: React.FC = () => (
  <AbsoluteFill>
    <Background />
    {timeline.scenes.map((s, i) => {
      const Scene = SCENES[s.id];
      const from = Math.round(s.start * FPS);
      const last = i === timeline.scenes.length - 1;
      const duration = (last ? timeline.durationInFrames : Math.round(s.end * FPS)) - from + (last ? 0 : 4);
      return (
        <Sequence key={s.id} from={from} durationInFrames={duration}>
          <SceneWrap duration={last ? duration + 999 : duration}>
            <Scene />
          </SceneWrap>
        </Sequence>
      );
    })}
    <Captions />
    <ProgressBar />
    <Audio src={staticFile('audio.wav')} />
  </AbsoluteFill>
);
