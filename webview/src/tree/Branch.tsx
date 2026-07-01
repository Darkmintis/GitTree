import React from 'react';
import { BranchLayout, TreeTheme, Vec2 } from '@shared/types';

interface BranchProps {
  branch: BranchLayout;
  trunkTip: Vec2;
  trunkBase: Vec2;
  theme: TreeTheme;
  getWindOffset: (x: number, y: number, phase: number, amplitude?: number) => number;
}

export function Branch({ branch, theme, getWindOffset, trunkTip, trunkBase }: BranchProps) {
  if (branch.path.length < 2) return null;

  if (branch.isMain) {
    return (
      <g className="trunk-group">
        <TrunkPath branch={branch} theme={theme} getWindOffset={getWindOffset} trunkTip={trunkTip} trunkBase={trunkBase} />
      </g>
    );
  }

  return (
    <g className={`branch branch-${branch.side}`} opacity={branch.opacity}>
      <BranchPath branch={branch} theme={theme} getWindOffset={getWindOffset} trunkTip={trunkTip} trunkBase={trunkBase} />
    </g>
  );
}

function TrunkPath({ branch, theme, getWindOffset }: BranchProps) {
  const d = buildPath(branch.path, getWindOffset, true);

  return (
    <>
      <defs>
        <linearGradient id={`trunk-fill-${branch.id}`} x1="0" y1="1" x2="0" y2="0">
          {theme.trunk.gradient.map((color, i) => (
            <stop key={i} offset={`${(i / (theme.trunk.gradient.length - 1)) * 100}%`} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={`url(#trunk-fill-${branch.id})`}
        strokeWidth={branch.thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
          transition: 'd 0.1s ease',
        }}
      />
      {branch.path.map((p, i) => {
        if (i % 3 !== 0 || i === 0 || i === branch.path.length - 1) return null;
        const wind = getWindOffset(p.x, p.y, i * 0.3, 1);
        return (
          <circle
            key={`k-${i}`}
            cx={p.x + wind}
            cy={p.y}
            r={branch.thickness * 0.12}
            fill={theme.trunk.secondary}
            opacity={0.25}
          />
        );
      })}
    </>
  );
}

function BranchPath({ branch, theme, getWindOffset }: BranchProps) {
  const d = buildPath(branch.path, getWindOffset, false);

  return (
    <>
      <defs>
        <linearGradient id={`branch-fill-${branch.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.branch.gradient[0]} />
          <stop offset="50%" stopColor={theme.branch.gradient[1]} />
          <stop offset="100%" stopColor={theme.branch.gradient[2]} />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={`url(#branch-fill-${branch.id})`}
        strokeWidth={branch.thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'd 0.1s ease',
        }}
      />
    </>
  );
}

function buildPath(
  points: Vec2[],
  getWindOffset: (x: number, y: number, phase: number) => number,
  isSmooth: boolean
): string {
  if (points.length < 2) return '';

  let d = '';
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const wind = getWindOffset(p.x, p.y, i * 0.3);
    const x = p.x + wind;
    const y = p.y;

    if (i === 0) {
      d += `M ${x} ${y}`;
    } else if (!isSmooth || i === points.length - 1) {
      d += ` L ${x} ${y}`;
    } else {
      const prev = points[i - 1];
      const prevWind = getWindOffset(prev.x, prev.y, (i - 1) * 0.3);
      const cpx = (prev.x + prevWind + x) / 2;
      const cpy = (prev.y + y) / 2;
      d += ` Q ${cpx} ${cpy}, ${x} ${y}`;
    }
  }

  return d;
}
