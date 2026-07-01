import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useTreeStore } from '../store/treeStore';
import { useTreeLayout } from '../hooks/useTreeLayout';
import { useAnimation } from '../hooks/useAnimation';
import { Trunk } from './Trunk';
import { Branch as BranchComponent } from './Branch';
import { Leaf } from './Leaf';
import { Fruit } from './Fruit';
import { Flower } from './Flower';
import { GitCommit } from '@shared/types';

declare function acquireVsCodeApi(): any;
const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

const SEED_ICON = '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4L24 28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 14C12 14 8 18 8 22C8 26 12 28 16 28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M32 14C36 14 40 18 40 22C40 26 36 28 32 28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M24 20C21 20 18 23 18 26C18 29 21 31 24 31C27 31 30 29 30 26C30 23 27 20 24 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 31L16 38" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M28 31L32 38" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

export function TreeRenderer() {
  const { treeData, theme, viewState, setViewState, setHoveredCommit, selectCommit, selectedCommit, hoveredCommit, settings, replayProgress, isReplaying } = useTreeStore();
  const treeLayout = useTreeLayout(treeData, theme.name);
  const { getWindOffset } = useAnimation();

  const svgRef = useRef<SVGSVGElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });
  const [isRotating, setIsRotating] = useState(false);
  const [rotateStart, setRotateStart] = useState({ x: 0, y: 0, angle: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current?.parentElement) {
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as SVGElement;
    if (target === svgRef.current || target.classList.contains('tree-bg') || target.classList.contains('ground-area') || target.classList.contains('scene-bg') || target.closest('.tree-group') || target.closest('.ground-layer') || target.closest('.grass-layer')) {
      setIsRotating(true);
      setRotateStart({ x: e.clientX, y: e.clientY, angle: viewState.rotation });
    }
  }, [viewState.rotation]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isRotating) return;
    const dx = e.clientX - rotateStart.x;
    const rot = rotateStart.angle + dx * 0.4;
    setViewState({ rotation: rot });
  }, [isRotating, rotateStart, setViewState]);

  const handleMouseUp = useCallback(() => {
    setIsRotating(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.shiftKey) {
      const rot = viewState.rotation - e.deltaY * 0.3;
      setViewState({ rotation: rot });
      return;
    }
    const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
    setViewState({ zoom: clamp(viewState.zoom * zoomFactor, 0.1, 5) });
  }, [viewState.zoom, viewState.rotation, setViewState]);

  const handleLeafClick = useCallback((commit: GitCommit) => {
    selectCommit(commit);
    vscode?.postMessage({ type: 'openCommit', hash: commit.hash });
  }, [selectCommit]);

  const handleLeafHover = useCallback((commit: GitCommit | null) => {
    setHoveredCommit(commit);
  }, [setHoveredCommit]);

  if (!treeLayout || !treeData) {
    return (
      <div className="tree-loading" style={{ color: theme.text.primary }}>
        <div className="seed-icon" dangerouslySetInnerHTML={{ __html: SEED_ICON }} />
        <p>Planting your tree...</p>
      </div>
    );
  }

  const visibleLeaves = settings.showLeaves ? treeLayout.branches.flatMap(b =>
    isReplaying ? b.leaves.filter((_, i) => i / b.leaves.length <= replayProgress) : b.leaves
  ) : [];

  const { w, h } = containerSize;
  const groundY = h * 0.82;
  const horizonY = h * 0.60;
  const groundH = h - groundY;

  const cx = w / 2;
  const cy = groundY;
  const baseScale = Math.min(w / 900, h / 700, 1.2);

  const grasses: JSX.Element[] = [];
  for (let i = 0; i < 30; i++) {
    const gx = (i / 30) * w;
    const gh = 4 + Math.sin(i * 1.7) * 3 + 3;
    grasses.push(
      <path key={`grass-${i}`}
        d={`M${gx},${groundY} Q${gx + 2},${groundY - gh} ${gx + 1},${groundY - gh * 0.8} Q${gx - 2},${groundY - gh * 0.5} ${gx - 1},${groundY}`}
        fill={theme.background.ground[0]} opacity={0.6 + Math.sin(i * 2.3) * 0.2} />
    );
  }

  const stars: JSX.Element[] = [];
  if (theme.name === 'fantasy' || theme.name === 'darkForest') {
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97.3 + 13) % w;
      const sy = (i * 53.7 + 7) % horizonY;
      stars.push(<circle key={`star-${i}`} cx={sx} cy={sy} r={0.5 + (i % 3) * 0.3} fill="white" opacity={0.3 + (i % 5) * 0.12} />);
    }
  }

  const hills: JSX.Element[] = [];
  for (let i = 0; i < 4; i++) {
    const hx = i * w * 0.3 - w * 0.05;
    const hw = w * 0.35 + Math.sin(i * 0.7) * w * 0.05;
    const hh = 20 + Math.sin(i * 1.1) * 10 + i * 5;
    hills.push(<ellipse key={`hill-${i}`} cx={hx} cy={groundY} rx={hw} ry={hh} fill={theme.background.ground[0]} opacity={0.15 + i * 0.05} />);
  }

  const groundCircles: JSX.Element[] = [];
  for (let i = 0; i < 12; i++) {
    const gcx = (i / 12) * w + Math.sin(i * 3.1) * 15;
    const gcy = groundY + 4 + Math.sin(i * 2.7) * 3;
    groundCircles.push(<circle key={`gc-${i}`} cx={gcx} cy={gcy} r={3 + Math.sin(i * 1.3) * 2} fill={theme.background.ground[2]} opacity={0.2} />);
  }

  return (
    <svg
      ref={svgRef}
      className="tree-renderer"
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isRotating ? ' grabbing' : 'grab' }}
    >
      <defs>
        {treeLayout.branches.map(b => (
          <filter key={`glow-${b.id}`} id={`glow-${b.id}`}>
            <feGaussianBlur stdDeviation={b.isMain ? 1.5 : 0.5} result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
        <filter id="leaf-glow"><feGaussianBlur stdDeviation="0.5" /></filter>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.background.sky[0]} />
          <stop offset="50%" stopColor={theme.background.sky[1]} />
          <stop offset="100%" stopColor={theme.background.sky[2]} />
        </linearGradient>
        <linearGradient id="ground-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.background.ground[0]} />
          <stop offset="50%" stopColor={theme.background.ground[1]} />
          <stop offset="100%" stopColor={theme.background.ground[2]} />
        </linearGradient>
        {theme.effects.glow && (
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.accent} stopOpacity="0.15" />
            <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      <rect className="scene-bg tree-bg" width={w} height={h} fill="url(#sky-grad)" />

      {theme.name !== 'fantasy' && theme.name !== 'darkForest' && (
        <circle cx={w * 0.8} cy={horizonY * 0.3} r={Math.min(w, h) * 0.15} fill="url(#sun-glow)" opacity={0.5} />
      )}

      <g className="sky-layer">{stars}</g>
      <g className="hills-layer">{hills}</g>

      <g
        className="zoomable-scene"
        transform={`translate(${cx}, ${cy}) rotate(${viewState.rotation}) scale(${viewState.zoom * baseScale}) translate(${-cx}, ${-cy})`}
      >
        <rect className="ground-area" x={0} y={groundY} width={w} height={groundH} fill="url(#ground-grad)" />
        <line x1={0} y1={groundY} x2={w} y2={groundY} stroke={theme.background.ground[0]} strokeWidth={1.5} opacity={0.6} />
        <line x1={0} y1={groundY + 1} x2={w} y2={groundY + 1} stroke={theme.background.ground[1]} strokeWidth={0.5} opacity={0.3} />

        <g className="ground-layer">{groundCircles}</g>
        <g className="grass-layer">{grasses}</g>

        {treeLayout.branches.map(branch => (
          <BranchComponent key={branch.id} branch={branch} trunkTip={treeLayout.trunkTip} trunkBase={treeLayout.trunkBase} theme={theme} getWindOffset={getWindOffset} />
        ))}

        {treeLayout.branches.map((branch, bi) =>
          branch.flowers.map((flower, fi) => <Flower key={`${bi}-${fi}`} flower={flower} theme={theme} />)
        )}

        {visibleLeaves.map((leaf, li) => (
          <Leaf key={leaf.id} leaf={leaf} theme={theme} getWindOffset={getWindOffset}
            onClick={() => handleLeafClick(leaf.commit)}
            onHover={(h) => handleLeafHover(h ? leaf.commit : null)}
            isSelected={selectedCommit?.hash === leaf.commit.hash}
            isHovered={hoveredCommit?.hash === leaf.commit.hash} />
        ))}

        {settings.showFruits && treeLayout.branches.map((branch, bi) =>
          branch.fruits.map((fruit, fi) => <Fruit key={`${bi}-${fi}`} fruit={fruit} theme={theme} />)
        )}

        {isReplaying && (
          <rect x={0} y={treeLayout.height - 20} width={treeLayout.width * replayProgress} height={2} fill={theme.accent} opacity={0.5} rx={1} />
        )}
      </g>
    </svg>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
