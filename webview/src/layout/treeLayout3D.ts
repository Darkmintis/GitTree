import { GitData, GitCommit, TreeLayout3D, BranchSegment3D, LeafInstance, Decoration3D, Vec3, TreeTheme } from '@shared/types';

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getLeafColor(t: number, theme: TreeTheme): string {
  if (t < 0.15) return theme.leaves.recent;
  if (t < 0.35) return theme.leaves.young;
  if (t < 0.65) return theme.leaves.mature;
  if (t < 0.85) return theme.leaves.old;
  return theme.leaves.stale;
}

function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function length(a: Vec3): number {
  return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}

function normalize(a: Vec3): Vec3 {
  const len = length(a) || 1;
  return { x: a.x / len, y: a.y / len, z: a.z / len };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function buildCurve(start: Vec3, end: Vec3, segments: number, bend: Vec3): Vec3[] {
  const points: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const et = easeInOut(t);
    const base = {
      x: lerp(start.x, end.x, et),
      y: lerp(start.y, end.y, et),
      z: lerp(start.z, end.z, et),
    };
    const curveAmt = Math.sin(t * Math.PI) * 0.55;
    points.push(add(base, scale(bend, curveAmt)));
  }
  return points;
}

function tangentAt(points: Vec3[], index: number): Vec3 {
  if (points.length < 2) return vec3(0, 1, 0);
  if (index <= 0) return normalize(add(points[1], scale(points[0], -1)));
  if (index >= points.length - 1) {
    return normalize(add(points[points.length - 1], scale(points[points.length - 2], -1)));
  }
  return normalize(add(points[index + 1], scale(points[index - 1], -1)));
}

/** Perpendicular outward direction around a branch tangent. */
function radialNormal(tangent: Vec3, angle: number): Vec3 {
  const up = Math.abs(tangent.y) > 0.9 ? vec3(1, 0, 0) : vec3(0, 1, 0);
  const side = normalize(cross(tangent, up));
  const binormal = normalize(cross(tangent, side));
  return normalize(
    add(scale(side, Math.cos(angle)), scale(binormal, Math.sin(angle)))
  );
}

function radiusAlong(branch: { radius: number; tipRadius: number }, t: number): number {
  return lerp(branch.radius, branch.tipRadius, t);
}

function makeLeaf(
  id: string,
  commit: GitCommit,
  woodPos: Vec3,
  normal: Vec3,
  woodRadius: number,
  theme: TreeTheme,
  ageT: number,
  appearAt: number,
  rand: () => number,
  interactive: boolean
): LeafInstance {
  const stem = 0.04 + woodRadius * 0.15;
  const blade = clamp(0.1 + Math.sqrt(Math.max(1, commit.filesChanged)) * 0.018, 0.09, 0.26);
  const attachPoint = add(woodPos, scale(normal, woodRadius * 0.92));
  const position = add(attachPoint, scale(normal, stem + blade * 0.55));

  return {
    id,
    commit,
    attachPoint,
    position,
    normal,
    scale: blade,
    color: getLeafColor(ageT + (rand() - 0.5) * 0.08, theme),
    rotation: rand() * Math.PI * 2,
    swayPhase: rand() * Math.PI * 2,
    appearAt,
    interactive,
  };
}

export function computeTreeLayout3D(data: GitData, theme: TreeTheme): TreeLayout3D {
  const mainBranch = data.branches.find((b) => b.isMain) || data.branches[0];
  if (!mainBranch || mainBranch.commits.length === 0) {
    return {
      branches: [],
      leaves: [],
      decorations: [],
      trunkHeight: 4,
      canopyRadius: 2,
      totalLeaves: 0,
    };
  }

  const rand = seededRandom(mainBranch.commits.length * 97 + data.totalBranches * 13 + 7);
  const commits = [...mainBranch.commits].reverse();
  const commitCount = commits.length;
  const featureBranches = data.branches.filter((b) => !b.isMain);

  const trunkHeight = clamp(3.5 + commitCount * 0.045, 4, 12);
  const baseRadius = clamp(0.18 + commitCount * 0.004 + featureBranches.length * 0.02, 0.2, 0.55);
  const tipRadius = clamp(baseRadius * 0.22, 0.06, 0.16);

  const trunkPoints: Vec3[] = [];
  for (let i = 0; i < commits.length; i++) {
    const t = commits.length > 1 ? i / (commits.length - 1) : 0;
    const y = t * trunkHeight;
    const sway = Math.sin(t * Math.PI * 2.2) * (1 - t) * 0.12;
    trunkPoints.push(vec3(sway, y, Math.cos(t * Math.PI * 1.7) * (1 - t) * 0.06));
  }

  const trunkSeg: BranchSegment3D = {
    id: 'trunk',
    name: mainBranch.name,
    points: trunkPoints,
    radius: baseRadius,
    tipRadius,
    isMain: true,
    isCurrent: mainBranch.isCurrent,
    appearAt: 0,
    color: theme.trunk.primary,
  };

  const leaves: LeafInstance[] = [];
  const decorations: Decoration3D[] = [];

  // Trunk leaves — spiral tightly around the wood
  for (let i = 0; i < commits.length; i++) {
    const t = commits.length > 1 ? i / (commits.length - 1) : 0;
    const woodPos = trunkPoints[i];
    const tangent = tangentAt(trunkPoints, i);
    const r = radiusAlong(trunkSeg, t);
    const appearAt = 0.08 + t * 0.42;
    const commit = commits[i];
    const angle = i * 2.399963;

    leaves.push(
      makeLeaf(
        `leaf-trunk-${commit.hash.substring(0, 7)}`,
        commit,
        woodPos,
        radialNormal(tangent, angle),
        r,
        theme,
        1 - t,
        appearAt,
        rand,
        true
      )
    );

    // One companion leaf on the opposite side for fuller canopy, same commit
    leaves.push(
      makeLeaf(
        `leaf-trunk-${commit.hash.substring(0, 7)}-b`,
        commit,
        woodPos,
        radialNormal(tangent, angle + Math.PI * 0.85),
        r,
        theme,
        1 - t,
        appearAt + 0.01,
        rand,
        false
      )
    );

    if (commit.isMerge) {
      const n = radialNormal(tangent, angle + 1.2);
      const attachPoint = add(woodPos, scale(n, r));
      decorations.push({
        id: `flower-${commit.hash.substring(0, 7)}`,
        attachPoint,
        position: add(attachPoint, scale(n, 0.14)),
        scale: 0.16,
        color: theme.flowers.petal,
        type: 'flower',
        label: 'merge',
        appearAt: appearAt + 0.04,
        commit,
      });
    }
  }

  const branches: BranchSegment3D[] = [trunkSeg];
  const goldenAngle = 2.399963;
  let branchIndex = 0;

  for (const branch of featureBranches) {
    const branchCommits = [...branch.commits].reverse();
    if (branchCommits.length === 0) continue;

    const sideAngle = branchIndex * goldenAngle;
    const elev = lerp(0.28, 0.78, (branchIndex % 5) / 5);

    let attachIdx = branch.baseCommit
      ? commits.findIndex((c) => c.hash === branch.baseCommit || c.hash.startsWith(branch.baseCommit!.substring(0, 7)))
      : -1;
    if (attachIdx < 0) attachIdx = Math.floor(commits.length * elev);
    attachIdx = clamp(attachIdx, 0, trunkPoints.length - 1);

    const start = trunkPoints[attachIdx];
    const branchLen = clamp(1.4 + branchCommits.length * 0.38, 1.6, 5.8);
    const upBias = 0.4 + rand() * 0.22;
    const dir = normalize(
      vec3(Math.cos(sideAngle) * 0.92, upBias, Math.sin(sideAngle) * 0.92)
    );
    const end = add(start, scale(dir, branchLen));
    const bend = normalize(
      vec3(-dir.z * 0.35, 0.55, dir.x * 0.35)
    );

    const segments = Math.max(5, Math.min(14, branchCommits.length + 3));
    const points = buildCurve(start, end, segments, bend);
    const appearAt = 0.45 + (branchIndex / Math.max(1, featureBranches.length)) * 0.25;
    const bradius = clamp(baseRadius * 0.32, 0.05, 0.16);

    const branchSeg: BranchSegment3D = {
      id: `branch-${branch.name}`,
      name: branch.name,
      points,
      radius: bradius,
      tipRadius: 0.028,
      isMain: false,
      isCurrent: branch.isCurrent,
      appearAt,
      color: theme.branch.primary,
    };
    branches.push(branchSeg);

    for (let i = 0; i < branchCommits.length; i++) {
      const t = branchCommits.length > 1 ? i / (branchCommits.length - 1) : 1;
      const pathIdx = Math.min(Math.round(t * (points.length - 1)), points.length - 1);
      const woodPos = points[pathIdx];
      const tangent = tangentAt(points, pathIdx);
      const r = radiusAlong(branchSeg, t);
      const commit = branchCommits[i];
      const angle = i * goldenAngle + sideAngle;

      leaves.push(
        makeLeaf(
          `leaf-${branch.name}-${commit.hash.substring(0, 7)}`,
          commit,
          woodPos,
          radialNormal(tangent, angle),
          r,
          theme,
          t,
          appearAt + t * 0.2,
          rand,
          true
        )
      );

      leaves.push(
        makeLeaf(
          `leaf-${branch.name}-${commit.hash.substring(0, 7)}-b`,
          commit,
          woodPos,
          radialNormal(tangent, angle + Math.PI * 0.7),
          r,
          theme,
          t,
          appearAt + t * 0.2 + 0.01,
          rand,
          false
        )
      );
    }

    // Fruit hangs from branch tip with a short stem
    const tip = points[points.length - 1];
    const tipTangent = tangentAt(points, points.length - 1);
    const hang = normalize(add(scale(tipTangent, -0.15), vec3(0, -1, 0)));
    const tipR = branchSeg.tipRadius;
    const fruitAttach = add(tip, scale(hang, tipR));
    decorations.push({
      id: `fruit-${branch.name}`,
      attachPoint: fruitAttach,
      position: add(fruitAttach, scale(hang, 0.16)),
      scale: 0.12,
      color: branch.mergeCommit ? theme.fruits.merged : theme.fruits.open,
      type: 'fruit',
      label: branch.name,
      appearAt: appearAt + 0.18,
    });

    branchIndex++;
  }

  // Release flowers on trunk at matching commits
  for (const tag of data.tags.slice(0, 6)) {
    if (!tag.isRelease) continue;
    const idx = commits.findIndex(
      (c) => c.hash === tag.commitHash || c.hash.startsWith(tag.commitHash.substring(0, 7))
    );
    if (idx < 0) continue;
    const woodPos = trunkPoints[idx];
    const t = commits.length > 1 ? idx / (commits.length - 1) : 0;
    const tangent = tangentAt(trunkPoints, idx);
    const n = radialNormal(tangent, idx * 1.7 + 0.5);
    const r = radiusAlong(trunkSeg, t);
    const attachPoint = add(woodPos, scale(n, r));
    decorations.push({
      id: `flower-tag-${tag.name}`,
      attachPoint,
      position: add(attachPoint, scale(n, 0.18)),
      scale: 0.2,
      color: theme.flowers.petal,
      type: 'flower',
      label: tag.name,
      appearAt: 0.72,
      commit: commits[idx],
    });
  }

  let maxR = 0;
  for (const leaf of leaves) {
    maxR = Math.max(maxR, Math.hypot(leaf.position.x, leaf.position.z));
  }

  return {
    branches,
    leaves,
    decorations,
    trunkHeight,
    canopyRadius: Math.max(2, maxR),
    totalLeaves: leaves.length,
  };
}

export type { GitCommit };
