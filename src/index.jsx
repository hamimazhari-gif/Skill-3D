import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Story, Thumb} from './Video';
import {makeTiming, FPS} from './timing';
import {CharSheet} from './CharSheet';

const Root = () => (
  <>
    <Composition id="KnockerID" component={Story} defaultProps={{lang: 'id'}} width={1080} height={1920} fps={FPS} durationInFrames={makeTiming('id').frames} />
    <Composition id="KnockerEN" component={Story} defaultProps={{lang: 'en'}} width={1080} height={1920} fps={FPS} durationInFrames={makeTiming('en').frames} />
    <Composition id="ThumbEN" component={Thumb} defaultProps={{lang: 'en'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
    <Composition id="ThumbID" component={Thumb} defaultProps={{lang: 'id'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
    <Composition id="SheetExpr" component={CharSheet} defaultProps={{mode: 'expr', design: 'stout'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
    <Composition id="SheetPose" component={CharSheet} defaultProps={{mode: 'pose'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
  </>
);
registerRoot(Root);
