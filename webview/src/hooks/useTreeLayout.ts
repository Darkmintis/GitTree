import { useMemo } from 'react';
import { GitData, TreeLayout, Vec2, BranchLayout, CommitLayout, LeafLayout, ThemeName } from '@shared/types';
import { getTheme } from '../theme/themes';

function degToRad(deg: number): number { return (deg * Math.PI) / 180; }
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function clamp(v: number, min: number, max: number): number { return Math.max(min, Math.min(max, v)); }
function easeInOut(t: number): number { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

export function useTreeLayout(data: GitData | null, themeName: ThemeName): TreeLayout | null {
  return useMemo(() => {
    if (!data) return null;
    return computeTreeLayout(data, themeName);
  }, [data, themeName]);
}

function computeTreeLayout(data: GitData, themeName: ThemeName): TreeLayout {
  const theme = getTheme(themeName);
  const mainBranch = data.branches.find(b => b.isMain) || data.branches[0];
  if (!mainBranch) {
    return { branches: [], width: 800, height: 600, viewBox: '0 0 800 600', trunkTip: { x: 400, y: 50 }, trunkBase: { x: 400, y: 550 }, maxDepth: 0, totalLeaves: 0 };
  }

  const baseX = 400;
  const baseY = 580;
  const mainCommits = mainBranch.commits;
  const commitCount = mainCommits.length;
  const branchCount = data.branches.length;
  const hasFeatureBranches = branchCount > 1;

  const trunkHeight = clamp(commitCount * 4.5, 200, 520);
  const maxBranchLength = 250;

  const trunkLayout = buildTrunk(mainBranch, baseX, baseY, trunkHeight, commitCount, branchCount, theme, !hasFeatureBranches);
  const branchLayouts: BranchLayout[] = [trunkLayout];

  if (hasFeatureBranches) {
    const sideCounters = { left: 0, right: 0 };
    const featureBranches = data.branches.filter(b => !b.isMain);

    for (const branch of featureBranches) {
      const side: 'left' | 'right' = sideCounters.left <= sideCounters.right ? 'left' : 'right';
      sideCounters[side]++;

      const branchLayout = buildBranch(branch, data, trunkLayout, side, trunkHeight, baseY, maxBranchLength, theme);

      if (branchLayout) {
        branchLayouts.push(branchLayout);
      }
    }
  }

  const maxDepth = Math.max(...branchLayouts.map(b => b.depth));
  const totalLeaves = branchLayouts.reduce((acc, b) => acc + b.leaves.length, 0);
  const treeHeight = trunkHeight + 120;

  return {
    branches: branchLayouts,
    width: 800,
    height: treeHeight,
    viewBox: `0 0 800 ${treeHeight}`,
    trunkTip: trunkLayout.path[trunkLayout.path.length - 1],
    trunkBase: trunkLayout.path[0],
    maxDepth,
    totalLeaves,
  };
}

function buildTrunk(
  branch: import('@shared/types').GitBranch,
  baseX: number, baseY: number, trunkHeight: number,
  commitCount: number, branchCount: number,
  theme: import('@shared/types').TreeTheme,
  isStickMode: boolean
): BranchLayout {
  const commits = [...branch.commits].reverse();
  const path: Vec2[] = [];
  const branchCommits: CommitLayout[] = [];
  const leaves: LeafLayout[] = [];

  const commitFactor = clamp(commitCount / 100, 0.3, 1);
  const branchFactor = clamp(branchCount / 10, 0.3, 1);
  const totalFactor = (commitFactor + branchFactor) / 2;

  const minWidth = isStickMode ? 4 : 6;
  const maxWidth = isStickMode ? 10 : 22;
  const trunkWidth = lerp(minWidth, maxWidth, totalFactor);

  const trunkColor = theme.trunk.primary;

  for (let i = 0; i < commits.length; i++) {
    const t = commits.length > 1 ? i / (commits.length - 1) : 0;
    const et = easeInOut(t);
    const y = baseY - et * trunkHeight;

    let x: number;
    if (isStickMode) {
      x = baseX;
    } else {
      const phase = i * 0.3;
      const swayAmplitude = lerp(3, 0.5, t);
      x = baseX + Math.sin(phase) * swayAmplitude;
    }

    const commit = commits[i];
    branchCommits.push({
      hash: commit.hash, message: commit.message, author: commit.author, date: commit.date,
      position: { x, y }, size: 0, color: '', rotation: 0, opacity: 1,
      filesChanged: commit.filesChanged, isMerge: commit.isMerge, isHead: i === commits.length - 1,
    });

    const leafT = 1 - t;
    const leafColor = getLeafColor(leafT, theme);
    const baseSize = clamp(4 + Math.sqrt(commit.filesChanged || 1) * 2.5, 3, 18);
    const size = isStickMode ? baseSize * 1.2 : baseSize * (0.9 + Math.sin(i * 1.7) * 0.1);

    leaves.push({
      id: `leaf-${commit.hash.substring(0, 7)}`, commit,
      position: { x: x + (Math.random() - 0.5) * 3, y: y + (Math.random() - 0.5) * 2 },
      size, color: leafColor, rotation: (i * 37 + 15) % 360,
      opacity: clamp(0.6 + (1 - t) * 0.4, 0.4, 1),
      swayPhase: i * 1.1,
      shape: i % 3 === 0 ? 'heart' : i % 3 === 1 ? 'oval' : 'long',
    });

    path.push({ x, y });
  }

  return {
    id: 'trunk', name: branch.name, path, controlPoints: [],
    angle: -90, length: trunkHeight, thickness: trunkWidth,
    baseThickness: trunkWidth, tipThickness: clamp(trunkWidth * 0.2, 2, 6),
    color: trunkColor, opacity: 1,
    commits: branchCommits, startCommit: commits[0] || null, endCommit: commits[commits.length - 1] || null,
    isMain: true, isCurrent: branch.isCurrent, isStale: branch.isStale,
    depth: 0, side: 'right', branchPoint: path[0],
    leaves, fruits: [], flowers: [],
  };
}

function buildBranch(
  branch: import('@shared/types').GitBranch,
  data: GitData,
  trunkLayout: BranchLayout,
  side: 'left' | 'right',
  trunkHeight: number, baseY: number, maxBranchLength: number,
  theme: import('@shared/types').TreeTheme
): BranchLayout | null {
  const commits = [...branch.commits].reverse();
  if (commits.length === 0) return null;

  const depth = 1;
  const mainCommits = trunkLayout.commits;
  const baseCommitIdx = branch.baseCommit
    ? mainCommits.findIndex(c => c.hash === branch.baseCommit)
    : Math.floor(mainCommits.length * 0.6);
  const validIdx = baseCommitIdx >= 0 ? baseCommitIdx : Math.floor(mainCommits.length * 0.6);
  const branchPoint = trunkLayout.path[validIdx] || trunkLayout.path[Math.floor(trunkLayout.path.length / 2)];

  const goldenAngle = 137.508;
  const angleOffset = (side === 'left' ? 1 : -1) * (25 + Math.sin(depth * goldenAngle * 0.1) * 10);
  const angle = -90 + angleOffset;

  const branchLength = clamp(commits.length * 6.5, 30, maxBranchLength * (1 - depth * 0.1));
  const rad = degToRad(angle);
  const controlDist = branchLength * 0.55;

  const cp1x = branchPoint.x + Math.cos(degToRad(-90 + angleOffset * 0.7)) * controlDist;
  const cp1y = branchPoint.y + Math.sin(degToRad(-90 + angleOffset * 0.7)) * controlDist - 10;
  const endX = branchPoint.x + Math.cos(rad) * branchLength;
  const endY = branchPoint.y + Math.sin(rad) * branchLength;

  const path: Vec2[] = [];
  const branchCommits: CommitLayout[] = [];
  const leaves: LeafLayout[] = [];
  const fruits: import('@shared/types').FruitLayout[] = [];

  const branchColor = theme.branch.primary;
  const tipThicknessVal = clamp(6 - depth * 1.5, 1.5, 6);

  for (let i = 0; i < commits.length; i++) {
    const t = commits.length > 1 ? i / (commits.length - 1) : 0;
    const et = easeInOut(t);
    const px = lerp(lerp(branchPoint.x, cp1x, et), lerp(cp1x, endX, et), et);
    const py = lerp(lerp(branchPoint.y, cp1y, et), lerp(cp1y, endY, et), et);

    const commit = commits[i];
    branchCommits.push({
      hash: commit.hash, message: commit.message, author: commit.author, date: commit.date,
      position: { x: px, y: py }, size: 0, color: '', rotation: 0, opacity: 1,
      filesChanged: commit.filesChanged, isMerge: commit.isMerge, isHead: i === commits.length - 1,
    });

    const leafColor = getLeafColor(t, theme);
    const baseSize = clamp(3 + Math.sqrt(commit.filesChanged || 1) * 2, 2, 14);
    const size = baseSize * (0.85 + Math.cos(i * 2.3) * 0.15);

    leaves.push({
      id: `leaf-${commits[i].hash.substring(0, 7)}`, commit,
      position: { x: px + (Math.random() - 0.5) * 4, y: py + (Math.random() - 0.5) * 3 },
      size, color: leafColor, rotation: Math.random() * 360,
      opacity: clamp(0.7 + (1 - t) * 0.3, 0.3, 1),
      swayPhase: Math.random() * Math.PI * 2,
      shape: i % 4 === 0 ? 'heart' : i % 4 === 1 ? 'round' : i % 4 === 2 ? 'long' : 'oval',
    });

    path.push({ x: px, y: py });
  }

  return {
    id: `branch-${branch.name}`, name: branch.name, path,
    controlPoints: [{ x: cp1x, y: cp1y }],
    angle, length: branchLength,
    thickness: tipThicknessVal * 1.5,
    baseThickness: tipThicknessVal * 1.5, tipThickness: tipThicknessVal,
    color: branchColor, opacity: 0.9,
    commits: branchCommits, startCommit: commits[0] || null, endCommit: commits[commits.length - 1] || null,
    isMain: false, isCurrent: branch.isCurrent, isStale: branch.isStale,
    depth, side, branchPoint,
    leaves, fruits, flowers: [],
  };
}

function getLeafColor(t: number, theme: import('@shared/types').TreeTheme): string {
  if (t < 0.15) return theme.leaves.recent;
  if (t < 0.35) return theme.leaves.young;
  if (t < 0.65) return theme.leaves.mature;
  if (t < 0.85) return theme.leaves.old;
  return theme.leaves.stale;
}
