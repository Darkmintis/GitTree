import React from 'react';
import { FlowerLayout, TreeTheme } from '@shared/types';

interface FlowerProps {
  flower: FlowerLayout;
  theme: TreeTheme;
}

export function Flower({ flower, theme }: FlowerProps) {
  const petalCount = 5;
  const petals: JSX.Element[] = [];
  const r = flower.size * 0.6;

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const px = Math.cos(rad) * r;
    const py = Math.sin(rad) * r;
    petals.push(
      <ellipse
        key={i}
        cx={px}
        cy={py}
        rx={r * 0.6}
        ry={r * 0.4}
        fill={flower.petalColor}
        opacity={0.85}
        transform={`rotate(${angle}, ${px}, ${py})`}
        style={{ transformOrigin: '0 0' }}
      />
    );
  }

  return (
    <g
      className="flower"
      transform={`translate(${flower.position.x}, ${flower.position.y}) scale(${flower.bloomProgress})`}
      style={{ cursor: 'pointer' }}
    >
      {petals}
      <circle cx={0} cy={0} r={r * 0.35} fill={flower.centerColor} />
      <circle cx={0} cy={0} r={r * 0.15} fill={theme.flowers.petal} opacity={0.7} />
      <line x1={0} y1={0} x2={0} y2={-flower.size} stroke={theme.branch.primary} strokeWidth={1} opacity={0.5} />
    </g>
  );
}
