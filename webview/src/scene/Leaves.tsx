import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { LeafInstance, TreeTheme } from '@shared/types';
import { useTreeStore } from '../store/treeStore';

interface LeavesProps {
  leaves: LeafInstance[];
  theme: TreeTheme;
}

const MAX_LEAVES = 2200;

function orientLeaf(dummy: THREE.Object3D, normal: { x: number; y: number; z: number }, twist: number) {
  const n = new THREE.Vector3(normal.x, normal.y, normal.z).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
  const twistQ = new THREE.Quaternion().setFromAxisAngle(n, twist);
  dummy.quaternion.copy(quat).multiply(twistQ);
}

export function Leaves({ leaves }: LeavesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const replayProgress = useTreeStore((s) => s.replayProgress);
  const windEnabled = useTreeStore((s) => s.settings.windEnabled);
  const showLeaves = useTreeStore((s) => s.settings.showLeaves);
  const performanceMode = useTreeStore((s) => s.settings.performanceMode);
  const selectCommit = useTreeStore((s) => s.selectCommit);
  const setHoveredCommit = useTreeStore((s) => s.setHoveredCommit);
  const setHoverScreen = useTreeStore((s) => s.setHoverScreen);

  const visibleLeaves = useMemo(() => {
    // Prefer interactive leaves when culling for performance
    const interactive = leaves.filter((l) => l.interactive);
    const fillers = leaves.filter((l) => !l.interactive);
    const budget = performanceMode ? 700 : MAX_LEAVES;
    if (leaves.length <= budget) return leaves;
    const remaining = Math.max(0, budget - interactive.length);
    const step = fillers.length > remaining ? Math.ceil(fillers.length / remaining) : 1;
    return [...interactive, ...fillers.filter((_, i) => i % step === 0)].slice(0, budget);
  }, [leaves, performanceMode]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const hingeAxis = useMemo(() => new THREE.Vector3(), []);
  const tmpNormal = useMemo(() => new THREE.Vector3(), []);

  const base = useMemo(
    () =>
      visibleLeaves.map((leaf) => ({
        attachPoint: leaf.attachPoint,
        position: leaf.position,
        normal: leaf.normal,
        scale: leaf.scale,
        rotation: leaf.rotation,
        swayPhase: leaf.swayPhase,
        appearAt: leaf.appearAt,
        color: leaf.color,
        commit: leaf.commit,
        interactive: leaf.interactive,
      })),
    [visibleLeaves]
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const wind = windEnabled ? 1 : 0;

    for (let i = 0; i < base.length; i++) {
      const leaf = base[i];
      if (replayProgress < leaf.appearAt) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      const grow = Math.min(1, (replayProgress - leaf.appearAt) / 0.1);
      const sway = Math.sin(t * 1.6 + leaf.swayPhase) * 0.18 * wind;

      // Hinge around attach point — leaf stays connected to the wood
      tmpNormal.set(leaf.normal.x, leaf.normal.y, leaf.normal.z).normalize();
      hingeAxis.set(-tmpNormal.z, 0, tmpNormal.x);
      if (hingeAxis.lengthSq() < 0.001) hingeAxis.set(1, 0, 0);
      hingeAxis.normalize();

      const hinged = tmpNormal.clone().applyAxisAngle(hingeAxis, sway);
      const stemLen =
        Math.hypot(
          leaf.position.x - leaf.attachPoint.x,
          leaf.position.y - leaf.attachPoint.y,
          leaf.position.z - leaf.attachPoint.z
        ) || 0.12;

      dummy.position.set(
        leaf.attachPoint.x + hinged.x * stemLen,
        leaf.attachPoint.y + hinged.y * stemLen,
        leaf.attachPoint.z + hinged.z * stemLen
      );
      orientLeaf(dummy, hinged, leaf.rotation + sway * 0.35);
      const s = leaf.scale * grow;
      // Leaf blade: long/flat oval oriented along outward normal (Y local)
      dummy.scale.set(s * 0.7, s * 1.35, s * 0.22);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(leaf.color);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const pickLeaf = (e: ThreeEvent<MouseEvent>) => {
    const idx = e.instanceId;
    if (idx == null || idx < 0 || idx >= base.length) return null;
    if (replayProgress < base[idx].appearAt) return null;
    return base[idx];
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const leaf = pickLeaf(e);
    if (!leaf) return;
    selectCommit(leaf.commit);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const leaf = pickLeaf(e);
    if (!leaf) {
      setHoveredCommit(null);
      document.body.style.cursor = 'grab';
      return;
    }
    document.body.style.cursor = 'pointer';
    setHoveredCommit(leaf.commit);
    setHoverScreen({ x: e.clientX, y: e.clientY });
  };

  const handlePointerOut = () => {
    setHoveredCommit(null);
    document.body.style.cursor = 'grab';
  };

  if (!showLeaves || visibleLeaves.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, visibleLeaves.length]}
      castShadow
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[1, 10, 8]} />
      <meshStandardMaterial vertexColors roughness={0.5} metalness={0.02} flatShading />
    </instancedMesh>
  );
}
