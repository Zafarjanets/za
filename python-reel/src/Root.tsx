import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './Reel';
import {timeline} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PythonReel"
    component={Reel}
    durationInFrames={timeline.durationInFrames}
    fps={timeline.fps}
    width={1080}
    height={1920}
  />
);
