import React from 'react';
import { FruitLayout, TreeTheme } from '@shared/types';

interface FruitProps {
  fruit: FruitLayout;
  theme: TreeTheme;
}

export function Fruit({ fruit, theme }: FruitProps) {
  const color = theme.fruits[fruit.type] || theme.fruits.merged;
  const r = fruit.size * 0.5;

  return (
    <g
      className="fruit"
      transform={`translate(${fruit.position.x}, ${fruit.position.y})`}
      style={{ cursor: 'pointer' }}
    >
      {fruit.type === 'open' ? (
        <>
          <circle cx={0} cy={0} r={r} fill={color} opacity={0.9} />
          <path
            d={`M 0,-${r * 0.3} L ${r * 0.3},0 L 0,${r * 0.3} L -${r * 0.3},0 Z`}
            fill="white"
            opacity={0.6}
            transform={`rotate(${45})`}
          />
        </>
      ) : fruit.type === 'merged' ? (
        <>
          <circle cx={0} cy={0} r={r} fill={color} opacity={0.9} />
          <circle cx={0} cy={0} r={r * 0.5} fill={theme.background.primary} opacity={0.3} />
        </>
      ) : (
        <>
          <circle cx={0} cy={0} r={r} fill={color} opacity={0.5} />
          <line x1={-r * 0.4} y1={-r * 0.4} x2={r * 0.4} y2={r * 0.4} stroke={color} strokeWidth={1.5} opacity={0.7} />
          <line x1={r * 0.4} y1={-r * 0.4} x2={-r * 0.4} y2={r * 0.4} stroke={color} strokeWidth={1.5} opacity={0.7} />
        </>
      )}
      <line x1={0} y1={-r} x2={0} y2={-r - 3} stroke={theme.branch.primary} strokeWidth={1} />
    </g>
  );
}
