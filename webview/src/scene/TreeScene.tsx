import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { useTreeStore } from '../store/treeStore';
import { Atmosphere } from './Atmosphere';
import { LivingTree } from './LivingTree';
import { EARTH_RADIUS, earthSurfaceAt } from './PlanetEarth';

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

function PlantedTree({
  tree,
  theme,
  showLabel,
}: {
  tree: ReturnType<typeof useTreeStore.getState>['trees'][number];
  theme: ReturnType<typeof useTreeStore.getState>['theme'];
  showLabel: boolean;
}) {
  const quat = useMemo(() => {
    const { normal } = earthSurfaceAt(tree.position.x, tree.position.z);
    return new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal
    );
  }, [tree.position.x, tree.position.z]);

  return (
    <group position={[tree.position.x, tree.position.y, tree.position.z]} quaternion={quat}>
      <LivingTree layout={tree.layout} theme={theme} repoPath={tree.path} />
      {showLabel && (
        <Html position={[0, tree.layout.trunkHeight + 0.6, 0]} center distanceFactor={18} style={{ pointerEvents: 'none' }}>
          <div className="repo-label">{tree.name}</div>
        </Html>
      )}
    </group>
  );
}

function SceneContent() {
  const trees = useTreeStore((s) => s.trees);
  const theme = useTreeStore((s) => s.theme);
  const selectCommit = useTreeStore((s) => s.selectCommit);

  if (!trees.length) return null;

  const maxHeight = Math.max(...trees.map((t) => t.layout.trunkHeight), 5);
  const spread = trees.length > 1 ? 14 : 8;
  const camDist = Math.max(14, maxHeight * 1.2 + spread);
  const camY = Math.max(5, maxHeight * 0.55 + 2);

  return (
    <>
      <PerspectiveCamera makeDefault position={[camDist * 0.75, camY + 2, camDist * 0.9]} fov={42} />
      <Atmosphere theme={theme} onGroundClick={() => selectCommit(null)} />

      {trees.map((tree) => (
        <PlantedTree key={tree.id} tree={tree} theme={theme} showLabel={trees.length > 1} />
      ))}

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={EARTH_RADIUS * 1.5}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 - 0.02}
        target={[0, maxHeight * 0.35, 0]}
        enableDamping
        dampingFactor={0.06}
      />
      <ReplayTicker />
    </>
  );
}

export function TreeScene() {
  const loading = useTreeStore((s) => s.loading);
  const error = useTreeStore((s) => s.error);
  const trees = useTreeStore((s) => s.trees);

  if (error) {
    return (
      <div className="scene-fallback">
        <p>{error}</p>
      </div>
    );
  }

  if (loading || !trees.length) {
    return (
      <div className="scene-fallback">
        <div className="seed-pulse" />
        <p>Growing your {trees.length > 1 ? 'forest' : 'tree'}...</p>
      </div>
    );
  }

  return (
    <div className="scene-canvas">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => useTreeStore.getState().selectCommit(null)}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
