import React from 'react';
import { Sky, ContactShadows } from '@react-three/drei';
import { TreeTheme } from '@shared/types';
import { GrassField } from './GrassField';

interface AtmosphereProps {
  theme: TreeTheme;
}

export function Atmosphere({ theme }: AtmosphereProps) {
  const [sx, sy, sz] = theme.sky.sunPosition;

  return (
    <>
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#b8d4f0', 30, 75]} />

      <Sky
        distance={450000}
        sunPosition={[sx, sy, sz]}
        turbidity={theme.sky.turbidity}
        rayleigh={theme.sky.rayleigh}
        mieCoefficient={theme.sky.mieCoefficient}
        mieDirectionalG={0.85}
      />

      <ambientLight intensity={0.45} color="#fff8e7" />
      <hemisphereLight args={['#87CEEB', '#3d5c2e', 0.55]} />
      <directionalLight
        castShadow
        position={[sx, sy, sz]}
        intensity={1.6}
        color="#fff5d6"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      <mesh position={[sx * 0.35, sy * 0.35, sz * 0.35]}>
        <sphereGeometry args={[3.2, 24, 24]} />
        <meshBasicMaterial color="#FFF59D" />
      </mesh>
      <mesh position={[sx * 0.35, sy * 0.35, sz * 0.35]}>
        <sphereGeometry args={[5.5, 24, 24]} />
        <meshBasicMaterial color="#FFE082" transparent opacity={0.25} />
      </mesh>

      <group position={[-12, 10, -18]}>
        <mesh position={[0, 0, 0]}><sphereGeometry args={[1.8, 12, 12]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.45} roughness={1} /></mesh>
        <mesh position={[1.6, 0.2, 0.3]}><sphereGeometry args={[1.3, 12, 12]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.4} roughness={1} /></mesh>
        <mesh position={[-1.4, 0.1, -0.2]}><sphereGeometry args={[1.1, 12, 12]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.35} roughness={1} /></mesh>
      </group>
      <group position={[14, 12, -22]}>
        <mesh position={[0, 0, 0]}><sphereGeometry args={[2.1, 12, 12]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.38} roughness={1} /></mesh>
        <mesh position={[1.8, 0.15, -0.2]}><sphereGeometry args={[1.4, 12, 12]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.32} roughness={1} /></mesh>
      </group>

      <GrassField theme={theme} />

      <ContactShadows position={[0, 0.002, 0]} opacity={0.4} scale={28} blur={2.8} far={14} />
    </>
  );
}
