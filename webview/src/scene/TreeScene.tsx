import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useTreeStore } from '../store/treeStore';
import { Atmosphere } from './Atmosphere';
import { LivingTree } from './LivingTree';

function ReplayTicker() {
  const isReplaying = useTreeStore((s) => s.isReplaying);
  const animationSpeed = useTreeStore((s) => s.settings.animationSpeed);
  const setReplayProgress = useTreeStore((s) => s.setReplayProgress);
  const setIsReplaying = useTreeStore((s) => s.setIsReplaying);
  const speedRef = useRef(animationSpeed);

  useEffect(() => {
    speedRef.current = animationSpeed;
  }, [animationSpeed]);

  useEffect(() => {
    if (!isReplaying) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const current = useTreeStore.getState().replayProgress;
      const next = current + dt * 0.12 * speedRef.current;
      if (next >= 1) {
        setReplayProgress(1);
        setIsReplaying(false);
        return;
      }
      setReplayProgress(next);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isReplaying, setReplayProgress, setIsReplaying]);

  return null;
}

function SceneContent() {
  const layout = useTreeStore((s) => s.layout);
  const theme = useTreeStore((s) => s.theme);
  const selectCommit = useTreeStore((s) => s.selectCommit);

  if (!layout) return null;

  const camY = Math.max(3, layout.trunkHeight * 0.55);
  const camDist = Math.max(8, layout.trunkHeight * 1.1 + layout.canopyRadius);

  return (
    <>
      <PerspectiveCamera makeDefault position={[camDist * 0.7, camY + 1.5, camDist * 0.85]} fov={42} />
      <Atmosphere theme={theme} />
      <LivingTree layout={layout} theme={theme} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={28}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2 - 0.08}
        target={[0, layout.trunkHeight * 0.4, 0]}
        enableDamping
        dampingFactor={0.06}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        onClick={() => selectCommit(null)}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <ReplayTicker />
    </>
  );
}

export function TreeScene() {
  const loading = useTreeStore((s) => s.loading);
  const error = useTreeStore((s) => s.error);
  const layout = useTreeStore((s) => s.layout);

  if (error) {
    return (
      <div className="scene-fallback">
        <p>{error}</p>
      </div>
    );
  }

  if (loading || !layout) {
    return (
      <div className="scene-fallback">
        <div className="seed-pulse" />
        <p>Growing your tree...</p>
      </div>
    );
  }

  return (
    <div className="scene-canvas">
      <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true, alpha: false }}>
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
