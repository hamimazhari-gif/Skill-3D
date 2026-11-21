import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer, RoundedBox, Stars } from "@react-three/drei";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * IMPORTANT: In Remotion, animate ONLY from `useCurrentFrame()`.
 * Do NOT use `useFrame()` from @react-three/fiber or Date/clock-based animation —
 * it won't be deterministic and the rendered video will flicker / be out of sync.
 */
export const Scene3D: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 12 } });
  const rotation = frame * 0.02;
  const cameraZ = interpolate(frame, [0, 300], [8, 5.5], { extrapolateRight: "clamp" });

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ fov: 50, position: [0, 0, cameraZ] }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#0b0d17"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-4, -2, 3]} intensity={30} color={color} />

      {/* Main object */}
      <group scale={entrance} rotation={[rotation * 0.6, rotation, 0]}>
        <RoundedBox args={[2, 2, 2]} radius={0.25} smoothness={6}>
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
        </RoundedBox>
      </group>

      {/* Orbiting spheres */}
      {[0, 1, 2].map((i) => {
        const a = rotation * 1.5 + (i * Math.PI * 2) / 3;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.8, Math.sin(a * 2) * 0.5, Math.sin(a) * 2.8]} scale={entrance * 0.35}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.6} />
          </mesh>
        );
      })}

      {/* Deterministic star field (no animation inside, so it is safe) */}
      <Stars radius={50} depth={30} count={2000} factor={3} fade speed={0} />
      {/* Local reflections (no HDR download needed, so rendering works offline) */}
      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 5, -5]} scale={[10, 5, 1]} />
        <Lightformer intensity={1} position={[-5, 0, 0]} rotation-y={Math.PI / 2} scale={[10, 5, 1]} />
        <Lightformer intensity={1} color={color} position={[5, 0, 0]} rotation-y={-Math.PI / 2} scale={[10, 5, 1]} />
      </Environment>
    </ThreeCanvas>
  );
};
