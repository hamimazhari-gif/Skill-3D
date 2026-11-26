import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Story, Thumb} from './Video';
import {makeTiming, FPS} from './timing';
import {CharSheet} from './CharSheet';

const Root = () => (
  <>
    <Composition id="BibitSawitID" component={Story} defaultProps={{lang: 'id'}} width={1080} height={1920} fps={FPS} durationInFrames={makeTiming('id').frames} />
    <Composition id="ThumbID" component={Thumb} defaultProps={{lang: 'id'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
    <Composition id="SheetExpr" component={CharSheet} defaultProps={{mode: 'expr', design: 'reed'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
    <Composition id="SheetPose" component={CharSheet} defaultProps={{mode: 'pose'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
  </>
);
registerRoot(Root);
