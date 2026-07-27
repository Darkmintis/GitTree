import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeTheme } from '@shared/types';
import { useTreeStore } from '../store/treeStore';

interface GrassFieldProps {
  theme: TreeTheme;
  radius?: number;
  count?: number;
}

export function GrassField({ theme, radius = 18, count = 1200 }: GrassFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const windEnabled = useTreeStore((s) => s.settings.windEnabled);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const blades = useMemo(() => {
    const items: { x: number; z: number; h: number; phase: number; lean: number }[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i * 2.399963) % (Math.PI * 2);
      const r = Math.sqrt((i + 1) / count) * radius;
      // Keep a small clear circle around the trunk
      if (r < 0.55) continue;
      items.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        h: 0.12 + ((i * 17) % 10) * 0.018,
        phase: (i % 97) * 0.21,
        lean: ((i % 5) - 2) * 0.05,
      });
    }
    return items;
  }, [count, radius]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const wind = windEnabled ? 1 : 0;

    for (let i = 0; i < blades.length; i++) {
      const b = blades[i];
      const sway = Math.sin(t * 2.2 + b.phase) * 0.12 * wind;
      dummy.position.set(b.x, b.h * 0.5, b.z);
      dummy.rotation.set(b.lean + sway * 0.4, b.phase, sway);
      dummy.scale.set(0.035, b.h, 0.02);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Earth base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <circleGeometry args={[radius + 2, 72]} />
        <meshStandardMaterial color="#3d5c2e" roughness={0.98} />
      </mesh>
      {/* Richer turf near tree */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[radius * 0.55, 64]} />
        <meshStandardMaterial color={theme.grass} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <ringGeometry args={[0.5, 4.2, 48]} />
        <meshStandardMaterial color="#5dbe5a" roughness={1} />
      </mesh>

      <instancedMesh ref={meshRef} args={[undefined, undefined, blades.length]} castShadow={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={theme.grass} roughness={0.9} />
      </instancedMesh>
    </group>
  );
}
