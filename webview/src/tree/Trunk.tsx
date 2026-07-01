import React from 'react';
import { BranchLayout, TreeTheme, Vec2 } from '@shared/types';

interface TrunkProps {
  branch: BranchLayout;
  theme: TreeTheme;
  getWindOffset: (x: number, y: number, phase: number, amplitude?: number) => number;
}

export function Trunk({ branch, theme, getWindOffset }: TrunkProps) {
  if (branch.path.length < 2) return null;

  const d = buildSmoothPath(branch.path, getWindOffset, branch.leaves.length);
  const isMain = branch.isMain;

  return (
    <g className="trunk" opacity={branch.opacity}>
      <defs>
        <linearGradient id={`trunk-grad-${branch.id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={theme.trunk.gradient[0]} />
          <stop offset="50%" stopColor={theme.trunk.gradient[1]} />
          <stop offset="100%" stopColor={theme.trunk.gradient[2]} />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={`url(#trunk-grad-${branch.id})`}
        strokeWidth={branch.thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'stroke-width 0.3s ease',
          filter: isMain ? `drop-shadow(0 2px 4px rgba(0,0,0,0.3))` : 'none',
        }}
      />
      {branch.path.map((point, i) => {
        if (i === 0 || i === branch.path.length - 1) return null;
        const wind = getWindOffset(point.x, point.y, i * 0.3, 1);
        const size = Math.max(1, branch.thickness * 0.15);
        return (
          <circle
            key={`knot-${i}`}
            cx={point.x + wind}
            cy={point.y}
            r={size}
            fill={theme.trunk.secondary}
            opacity={0.3 + Math.sin(i * 0.5) * 0.1}
          />
        );
      })}
      {isMain && (
        <g className="trunk-texture">
          {branch.path.map((point, i) => {
            if (i % 3 !== 0) return null;
            const wind = getWindOffset(point.x, point.y, i * 0.3, 1);
            return (
              <line
                key={`texture-${i}`}
                x1={point.x + wind - branch.thickness * 0.2}
                y1={point.y - 2}
                x2={point.x + wind + branch.thickness * 0.2}
                y2={point.y + 2}
                stroke={theme.trunk.secondary}
                strokeWidth={0.5}
                opacity={0.2}
              />
            );
          })}
        </g>
      )}
    </g>
  );
}

function buildSmoothPath(
  points: Vec2[],
  getWindOffset: (x: number, y: number, phase: number, amplitude?: number) => number,
  leafCount: number
): string {
  if (points.length < 2) return '';

  let d = '';
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const wind = getWindOffset(p.x, p.y, i * 0.3, 1);
    const x = p.x + wind;
    const y = p.y;

    if (i === 0) {
      d += `M ${x} ${y}`;
    } else if (i === points.length - 1) {
      d += ` L ${x} ${y}`;
    } else {
      const prev = points[i - 1];
      const next = points[i + 1];
      const prevWind = getWindOffset(prev.x, prev.y, (i - 1) * 0.3, 1);
      const nextWind = getWindOffset(next.x, next.y, (i + 1) * 0.3, 1);

      const cpx1 = (prev.x + prevWind + x) / 2;
      const cpy1 = (prev.y + y) / 2;
      const cpx2 = (x + next.x + nextWind) / 2;
      const cpy2 = (y + next.y) / 2;

      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x} ${y}`;
    }
  }

  return d;
}
