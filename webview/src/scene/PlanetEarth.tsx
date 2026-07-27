import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTreeStore } from '../store/treeStore';

/** Shared planet size — north pole at y ≈ 0 */
export const EARTH_RADIUS = 32;
export const EARTH_CENTER_Y = -EARTH_RADIUS;

export function earthSurfaceAt(x: number, z: number): { y: number; normal: THREE.Vector3 } {
  const y = EARTH_CENTER_Y + Math.sqrt(Math.max(0.0001, EARTH_RADIUS * EARTH_RADIUS - x * x - z * z));
  const normal = new THREE.Vector3(x, y - EARTH_CENTER_Y, z).normalize();
  return { y, normal };
}

interface GrassPatch {
  cx: number;
  cz: number;
  radius: number;
}

interface Blade {
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
  h: number;
  phase: number;
  lean: number;
}

export function PlanetEarth({ onGroundClick }: { onGroundClick?: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const windEnabled = useTreeStore((s) => s.settings.windEnabled);
  const trees = useTreeStore((s) => s.trees);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const blades = useMemo(() => {
    const patches: GrassPatch[] = [];
    if (trees.length === 0) {
      patches.push({ cx: 0, cz: 0, radius: 5.5 });
      patches.push({ cx: 4.5, cz: -3.2, radius: 2.8 });
      patches.push({ cx: -5, cz: 2.5, radius: 3.2 });
    } else {
      for (const tree of trees) {
        patches.push({
          cx: tree.position.x,
          cz: tree.position.z,
          radius: 4.2 + Math.min(2, tree.data.totalCommits / 40),
        });
        const a = (tree.position.x * 0.3 + tree.position.z) % (Math.PI * 2);
        patches.push({
          cx: tree.position.x + Math.cos(a) * 6,
          cz: tree.position.z + Math.sin(a) * 6,
          radius: 2.4,
        });
      }
    }

    const items: Blade[] = [];
    let seed = 1;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (const patch of patches) {
      const count = Math.floor(180 + patch.radius * 55);
      for (let i = 0; i < count; i++) {
        const ang = rand() * Math.PI * 2;
        const rr = Math.sqrt(rand()) * patch.radius;
        const x = patch.cx + Math.cos(ang) * rr;
        const z = patch.cz + Math.sin(ang) * rr;
        if (x * x + z * z > EARTH_RADIUS * EARTH_RADIUS * 0.92) continue;
        const nearTrunk = trees.some(
          (t) => Math.hypot(x - t.position.x, z - t.position.z) < 0.5
        );
        if (nearTrunk) continue;

        const { y, normal } = earthSurfaceAt(x, z);
        items.push({
          x,
          y,
          z,
          nx: normal.x,
          ny: normal.y,
          nz: normal.z,
          h: 0.14 + rand() * 0.22,
          phase: rand() * Math.PI * 2,
          lean: (rand() - 0.5) * 0.15,
        });
      }
    }
    return items;
  }, [trees]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const wind = windEnabled ? 1 : 0;
    const up = new THREE.Vector3(0, 1, 0);
    const n = new THREE.Vector3();
    const quat = new THREE.Quaternion();

    for (let i = 0; i < blades.length; i++) {
      const b = blades[i];
      const sway = Math.sin(t * 2.4 + b.phase) * 0.14 * wind;
      n.set(b.nx, b.ny, b.nz);
      quat.setFromUnitVectors(up, n);
      dummy.position.set(b.x, b.y, b.z);
      dummy.quaternion.copy(quat);
      dummy.rotateX(b.lean + sway * 0.35);
      dummy.rotateZ(sway);
      dummy.scale.set(0.028, b.h, 0.016);
      dummy.translateY(b.h * 0.5);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh
        position={[0, EARTH_CENTER_Y, 0]}
        receiveShadow
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onGroundClick?.();
        }}
      >
        <sphereGeometry args={[EARTH_RADIUS, 72, 56]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.92} metalness={0.02} />
      </mesh>

      {blades.length > 0 && (
        <instancedMesh ref={meshRef} args={[undefined, undefined, blades.length]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#66BB6A" roughness={0.85} />
        </instancedMesh>
      )}
    </group>
  );
}
