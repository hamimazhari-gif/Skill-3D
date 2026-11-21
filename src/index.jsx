import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Story} from './Video';
import {makeTiming, FPS} from './timing';

const Root = () => (
  <>
    <Composition id="SejarahUangID" component={Story} defaultProps={{lang: 'id'}} width={1080} height={1920} fps={FPS} durationInFrames={makeTiming('id').frames} />
    <Composition id="HistoryOfMoneyEN" component={Story} defaultProps={{lang: 'en'}} width={1080} height={1920} fps={FPS} durationInFrames={makeTiming('en').frames} />
  </>
);
registerRoot(Root);
