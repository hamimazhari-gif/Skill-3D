import React from 'react';
import {registerRoot, Composition, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
const Box = () => { const f = useCurrentFrame(); return (<mesh rotation={[0.4, f/20, 0]}><boxGeometry args={[1,1,1]}/><meshToonMaterial color="#e0a060"/></mesh>); };
const T = () => (<ThreeCanvas width={1080} height={1920} style={{background:'#f3e7d3'}} camera={{fov:80, position:[0,0,3]}}><ambientLight intensity={0.5}/><directionalLight position={[-2,3,2]}/><Box/></ThreeCanvas>);
registerRoot(() => <Composition id="T" component={T} width={1080} height={1920} fps={30} durationInFrames={30}/>);
