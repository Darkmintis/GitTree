import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Decoration3D, TreeTheme } from '@shared/types';
import { useTreeStore } from '../store/treeStore';

interface DecorationsProps {
  decorations: Decoration3D[];
  theme: TreeTheme;
}

function Fruit({ item }: { item: Decoration3D }) {
  const group = useRef<THREE.Group>(null);
  const windEnabled = useTreeStore((s) => s.settings.windEnabled);
  const replayProgress = useTreeStore((s) => s.replayProgress);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const grow = Math.min(1, Math.max(0, (replayProgress - item.appearAt) / 0.12));
    group.current.scale.setScalar(grow);
    if (windEnabled) {
      group.current.rotation.z = Math.sin(t * 1.4 + item.appearAt * 3) * 0.08;
      group.current.rotation.x = Math.cos(t * 1.1 + item.appearAt * 2) * 0.05;
    }
  });

  if (replayProgress < item.appearAt) return null;

  const ax = item.attachPoint.x;
  const ay = item.attachPoint.y;
  const az = item.attachPoint.z;
  const dx = item.position.x - ax;
  const dy = item.position.y - ay;
  const dz = item.position.z - az;
  const stemLen = Math.hypot(dx, dy, dz) || 0.12;
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(dx, dy, dz).normalize()
  );

  return (
    <group ref={group} position={[ax, ay, az]}>
      <group quaternion={quat}>
        <mesh position={[0, stemLen * 0.5, 0]}>
          <cylinderGeometry args={[0.012, 0.016, stemLen, 6]} />
          <meshStandardMaterial color="#5D4037" roughness={0.9} />
        </mesh>
        <mesh position={[0, stemLen + item.scale * 0.85, 0]} castShadow>
          <sphereGeometry args={[item.scale, 14, 14]} />
          <meshStandardMaterial color={item.color} roughness={0.35} metalness={0.08} />
        </mesh>
        <mesh position={[item.scale * 0.5, stemLen + item.scale * 0.4, 0]} rotation={[0.4, 0.5, 0.8]} scale={[0.06, 0.1, 0.02]}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshStandardMaterial color="#66BB6A" />
        </mesh>
      </group>
    </group>
  );
}

function Flower({ item, theme }: { item: Decoration3D; theme: TreeTheme }) {
  const group = useRef<THREE.Group>(null);
  const windEnabled = useTreeStore((s) => s.settings.windEnabled);
  const replayProgress = useTreeStore((s) => s.replayProgress);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const grow = Math.min(1, Math.max(0, (replayProgress - item.appearAt) / 0.14));
    group.current.scale.setScalar(grow);
    if (windEnabled) {
      group.current.rotation.z = Math.sin(t * 1.6 + item.appearAt) * 0.1;
    }
  });

  if (replayProgress < item.appearAt) return null;

  const ax = item.attachPoint.x;
  const ay = item.attachPoint.y;
  const az = item.attachPoint.z;
  const dx = item.position.x - ax;
  const dy = item.position.y - ay;
  const dz = item.position.z - az;
  const stemLen = Math.hypot(dx, dy, dz) || 0.14;
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(dx, dy, dz).normalize()
  );

  const petals = 5;
  return (
    <group ref={group} position={[ax, ay, az]} quaternion={quat}>
      <mesh position={[0, stemLen * 0.45, 0]}>
        <cylinderGeometry args={[0.01, 0.014, stemLen, 5]} />
        <meshStandardMaterial color="#7CB342" roughness={0.85} />
      </mesh>
      <group position={[0, stemLen, 0]}>
        <mesh>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial
            color={theme.flowers.center}
            emissive={theme.flowers.center}
            emissiveIntensity={0.25}
          />
        </mesh>
        {Array.from({ length: petals }).map((_, i) => {
          const a = (i / petals) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.07, 0.01, Math.sin(a) * 0.07]}
              rotation={[0.55, a, 0]}
              scale={[0.055, 0.08, 0.02]}
            >
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color={theme.flowers.petal} roughness={0.45} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export function Decorations({ decorations, theme }: DecorationsProps) {
  const showFruits = useTreeStore((s) => s.settings.showFruits);
  const showFlowers = useTreeStore((s) => s.settings.showFlowers);

  return (
    <group>
      {decorations.map((d) => {
        if (d.type === 'fruit' && showFruits) return <Fruit key={d.id} item={d} />;
        if (d.type === 'flower' && showFlowers) return <Flower key={d.id} item={d} theme={theme} />;
        return null;
      })}
    </group>
  );
}
