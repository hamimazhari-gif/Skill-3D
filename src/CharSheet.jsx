// Test sheet: every expression and pose on the base character (for checking the acting kit).
import React, {useMemo, useEffect} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {makeChar, EXPRESSIONS, POSES, setCharDesign} from './char';
import {CREAM} from './kit';

function Grid({mode, design}) {
  const {scene, camera, gl} = useThree();
  const items = mode === 'expr' ? Object.keys(EXPRESSIONS) : Object.keys(POSES);
  const chars = useMemo(() => { if (design) setCharDesign(design); return items.map((k, i) => {
    const c = makeChar(['darto', 'kakek', 'darto', 'kakek'][i % 4], {});
    const cols = 5, x = (i % cols - (cols - 1) / 2) * 1.25, y = -Math.floor(i / cols) * 2.0;
    c.group.position.set(x, y, 0);
    c.act([{t: 0, [mode === 'expr' ? 'expr' : 'pose']: k}]);
    return c;
  }); }, [mode]);
  useEffect(() => { chars.forEach((c) => scene.add(c.group)); scene.background = new THREE.Color(CREAM); return () => chars.forEach((c) => scene.remove(c.group)); }, [chars, scene]);
  useFrame(() => {
    chars.forEach((c) => { if (!c.group.parent) scene.add(c.group); }); scene.background = new THREE.Color(CREAM);
    const rows = Math.ceil(items.length / 5);
    camera.position.set(0, -(rows - 1) * 1.0 + 0.9, 14); camera.lookAt(0, -(rows - 1) * 1.0 + 0.9, 0);
    chars.forEach((c) => c.update(1.0, camera.position));
    gl.render(scene, camera);
  }, 1);
  return null;
}
export const CharSheet = ({mode, design}) => {
  const {width, height} = useVideoConfig();
  return (<AbsoluteFill style={{background: CREAM}}><ThreeCanvas width={width} height={height} flat camera={{fov: 50}}><Grid mode={mode} design={design} /></ThreeCanvas>
    <AbsoluteFill style={{fontFamily: 'Inter', fontSize: 26, color: '#351f22'}}>{(mode === 'expr' ? Object.keys(EXPRESSIONS) : Object.keys(POSES)).map((k, i) => <div key={k} style={{position: 'absolute', left: (i % 5) * 216 + 20, top: Math.floor(i / 5) * (1920 / Math.max(4, Math.ceil(Object.keys(mode === 'expr' ? EXPRESSIONS : POSES).length / 5))) + 10}}>{k}</div>)}</AbsoluteFill></AbsoluteFill>);
};
