import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { TreeTheme } from '@shared/types';
import { PlanetEarth } from './PlanetEarth';

interface AtmosphereProps {
  theme: TreeTheme;
  onGroundClick?: () => void;
}

function CloudPuff({
  offset,
  speed,
  y,
  z,
  scale,
}: {
  offset: number;
  speed: number;
  y: number;
  z: number;
  scale: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime * speed + offset;
    group.current.position.x = Math.sin(t * 0.15) * 28 + Math.cos(t * 0.07) * 8;
    group.current.position.y = y + Math.sin(t * 0.2) * 0.6;
    group.current.position.z = z + Math.cos(t * 0.12) * 6;
  });

  const parts = useMemo(
    () => [
      { p: [0, 0, 0] as [number, number, number], r: 1.8 * scale },
      { p: [1.7 * scale, 0.25 * scale, 0.3 * scale] as [number, number, number], r: 1.35 * scale },
      { p: [-1.5 * scale, 0.15 * scale, -0.25 * scale] as [number, number, number], r: 1.2 * scale },
      { p: [0.4 * scale, 0.55 * scale, -0.5 * scale] as [number, number, number], r: 1.0 * scale },
    ],
    [scale]
  );

  return (
    <group ref={group}>
      {parts.map((part, i) => (
        <mesh key={i} position={part.p}>
          <sphereGeometry args={[part.r, 12, 10]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.72} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function MovingClouds() {
  return (
    <group>
      <CloudPuff offset={0} speed={1} y={16} z={-26} scale={1.15} />
      <CloudPuff offset={2.1} speed={0.85} y={18} z={-22} scale={0.9} />
      <CloudPuff offset={4.4} speed={1.1} y={14} z={-30} scale={1.35} />
      <CloudPuff offset={1.2} speed={0.7} y={20} z={18} scale={1.05} />
      <CloudPuff offset={3.3} speed={0.95} y={15} z={22} scale={0.85} />
      <CloudPuff offset={5.5} speed={0.8} y={19} z={-8} scale={1.2} />
    </group>
  );
}

export function Atmosphere({ onGroundClick }: AtmosphereProps) {
  const sunPos: [number, number, number] = [70, 55, -25];

  return (
    <>
      <color attach="background" args={['#4FA8E8']} />
      <fog attach="fog" args={['#8EC8F0', 55, 110]} />

      <Sky
        distance={450000}
        sunPosition={sunPos}
        turbidity={2.2}
        rayleigh={2.8}
        mieCoefficient={0.003}
        mieDirectionalG={0.9}
      />

      <ambientLight intensity={0.55} color="#e8f4ff" />
      <hemisphereLight args={['#7EC8F8', '#4CAF50', 0.65]} />
      <directionalLight
        castShadow
        position={sunPos}
        intensity={1.85}
        color="#FFF6D5"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={90}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
      />

      <group position={[sunPos[0] * 0.42, sunPos[1] * 0.42, sunPos[2] * 0.42]}>
        <mesh>
          <sphereGeometry args={[4.2, 28, 28]} />
          <meshBasicMaterial color="#FFF59D" />
        </mesh>
        <mesh>
          <sphereGeometry args={[7.5, 28, 28]} />
          <meshBasicMaterial color="#FFE082" transparent opacity={0.28} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[11, 28, 28]} />
          <meshBasicMaterial color="#FFECB3" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      </group>

      <MovingClouds />
      <PlanetEarth onGroundClick={onGroundClick} />
    </>
  );
}
