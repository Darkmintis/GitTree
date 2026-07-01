import React, { useMemo } from 'react';
import { LeafLayout, TreeTheme } from '@shared/types';

interface LeafProps {
  leaf: LeafLayout;
  theme: TreeTheme;
  getWindOffset: (x: number, y: number, phase: number, amplitude?: number) => number;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  isSelected: boolean;
  isHovered: boolean;
}

export function Leaf({ leaf, theme, getWindOffset, onClick, onHover, isSelected, isHovered }: LeafProps) {
  const windOffset = getWindOffset(leaf.position.x, leaf.position.y, leaf.swayPhase, 2);
  const x = leaf.position.x + windOffset;
  const y = leaf.position.y;

  const leafPath = useMemo(() => {
    const s = leaf.size;
    const hw = s * 0.5;
    const hh = s * 0.3;
    switch (leaf.shape) {
      case 'heart':
        return `M 0,-${hh} C ${hw},-${hh * 0.3} ${hw},${hh * 0.3} 0,${hh} C -${hw},${hh * 0.3} -${hw},-${hh * 0.3} 0,-${hh} Z`;
      case 'round':
        return `M 0,-${s * 0.45} A ${s * 0.45} ${s * 0.45} 0 1 1 0,${s * 0.45} A ${s * 0.45} ${s * 0.45} 0 1 1 0,-${s * 0.45} Z`;
      case 'long':
        return `M 0,-${hh * 1.5} C ${hw * 0.6},-${hh * 0.8} ${hw * 0.8},${hh * 0.3} 0,${hh * 1.2} C -${hw * 0.8},${hh * 0.3} -${hw * 0.6},-${hh * 0.8} 0,-${hh * 1.5} Z`;
      case 'oval':
      default:
        return `M 0,-${hh * 1.2} C ${hw},-${hh * 0.6} ${hw},${hh * 0.6} 0,${hh * 1.2} C -${hw},${hh * 0.6} -${hw},-${hh * 0.6} 0,-${hh * 1.2} Z`;
    }
  }, [leaf.size, leaf.shape]);

  const scale = isSelected ? 1.3 : isHovered ? 1.15 : 1;
  const glowFilter = isSelected || isHovered ? 'url(#leaf-glow)' : undefined;

  return (
    <g
      className={`leaf ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      transform={`translate(${x}, ${y}) rotate(${leaf.rotation + windOffset * 0.5}) scale(${scale})`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
    >
      <path
        d={leafPath}
        fill={leaf.color}
        opacity={leaf.opacity}
        filter={glowFilter}
        stroke={isSelected ? theme.accent : 'none'}
        strokeWidth={isSelected ? 0.5 : 0}
      />
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={leaf.size * 0.5}
        stroke={theme.trunk.secondary}
        strokeWidth={0.3}
        opacity={0.4}
      />
    </g>
  );
}
