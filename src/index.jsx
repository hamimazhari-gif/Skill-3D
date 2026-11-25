import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Story, Thumb, Photo, ThumbCollage} from './Video';
import {makeTiming, FPS} from './timing';
import {CharSheet} from './CharSheet';

const Root = () => (
  <>
    <Composition id="TubuhID" component={Story} defaultProps={{lang: 'id'}} width={1080} height={1920} fps={FPS} durationInFrames={makeTiming('id').frames} />
    <Composition id="PhotoID" component={Photo} defaultProps={{lang: 'id', t: 1, loc: 'jakarta', pos: [0, 1.7, 1], look: [0, 1.7, -2]}} width={1080} height={1080} fps={FPS} durationInFrames={1} />
    <Composition id="ThumbCollageID" component={ThumbCollage} defaultProps={{lang: 'id'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
    <Composition id="ThumbID" component={Thumb} defaultProps={{lang: 'id'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
    <Composition id="SheetExpr" component={CharSheet} defaultProps={{mode: 'expr', design: 'dapper'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
    <Composition id="SheetPose" component={CharSheet} defaultProps={{mode: 'pose'}} width={1080} height={1920} fps={FPS} durationInFrames={1} />
  </>
);
registerRoot(Root);
