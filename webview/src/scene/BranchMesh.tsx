import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BranchSegment3D, TreeTheme } from '@shared/types';
import { useTreeStore } from '../store/treeStore';

interface BranchMeshProps {
  branch: BranchSegment3D;
  theme: TreeTheme;
}

export function BranchMesh({ branch, theme }: BranchMeshProps) {
  const replayProgress = useTreeStore((s) => s.replayProgress);
  const windEnabled = useTreeStore((s) => s.settings.windEnabled);
  const groupRef = useRef<THREE.Group>(null);

  const visible = replayProgress >= branch.appearAt;
  const growT =
    branch.appearAt >= 1
      ? 1
      : Math.max(0, Math.min(1, (replayProgress - branch.appearAt) / 0.15));

  const { geometry, material } = useMemo(() => {
    if (branch.points.length < 2) {
      return { geometry: new THREE.BufferGeometry(), material: new THREE.MeshStandardMaterial() };
    }

    const curve = new THREE.CatmullRomCurve3(
      branch.points.map((p) => new THREE.Vector3(p.x, p.y, p.z))
    );
    const tubularSegments = Math.max(8, branch.points.length * 4);
    const geo = new THREE.TubeGeometry(curve, tubularSegments, branch.radius, 8, false);

    // Taper tip by scaling vertex distances along the path
    const pos = geo.attributes.position;
    const tmp = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      tmp.fromBufferAttribute(pos, i);
      // Approximate progress along tube via Y for trunk, or distance from start
      const start = branch.points[0];
      const end = branch.points[branch.points.length - 1];
      const totalLen = Math.hypot(end.x - start.x, end.y - start.y, end.z - start.z) || 1;
      const along = Math.hypot(tmp.x - start.x, tmp.y - start.y, tmp.z - start.z) / totalLen;
      const t = Math.min(1, along);
      const radiusScale = THREE.MathUtils.lerp(1, branch.tipRadius / branch.radius, t);
      // Project onto local radial plane relative to curve tangent approx using Y-up
      const cx = THREE.MathUtils.lerp(start.x, end.x, t);
      const cz = THREE.MathUtils.lerp(start.z, end.z, t);
      const dx = tmp.x - cx;
      const dz = tmp.z - cz;
      tmp.x = cx + dx * radiusScale;
      tmp.z = cz + dz * radiusScale;
      pos.setXYZ(i, tmp.x, tmp.y, tmp.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: branch.isMain ? theme.trunk.primary : theme.branch.primary,
      roughness: 0.85,
      metalness: 0.05,
    });

    return { geometry: geo, material: mat };
  }, [branch, theme]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !windEnabled || branch.isMain) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.z = Math.sin(t * 0.6 + branch.appearAt * 4) * 0.012;
    groupRef.current.rotation.x = Math.cos(t * 0.45 + branch.appearAt * 3) * 0.008;
  });

  if (!visible || growT <= 0) return null;

  return (
    <group ref={groupRef} scale={[1, Math.max(0.05, growT), 1]}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
    </group>
  );
}
