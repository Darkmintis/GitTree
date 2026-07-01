import { GitData, GitBranch, GitCommit, TreeLayout, BranchLayout, CommitLayout, LeafLayout, Vec2, FruitLayout, FlowerLayout } from '../../shared/types';

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export class TreeParser {
  parse(data: GitData): TreeLayout {
    const mainBranch = data.branches.find(b => b.isMain) || data.branches[0];
    if (!mainBranch) return { branches: [], width: 800, height: 600, viewBox: '0 0 800 600', trunkTip: { x: 400, y: 50 }, trunkBase: { x: 400, y: 550 }, maxDepth: 0, totalLeaves: 0 };

    const baseX = 400;
    const baseY = 560;
    const trunkHeight = Math.max(200, Math.min(500, mainBranch.commits.length * 3.5));

    const trunkTip: Vec2 = { x: baseX, y: baseY - trunkHeight };

    const branchLayouts: BranchLayout[] = [];
    const mainLayout = this.buildMainBranch(mainBranch, baseX, baseY, trunkHeight);

    branchLayouts.push(mainLayout);

    const featureBranches = data.branches.filter(b => !b.isMain);
    let sideToggle = 0;
    const mainCommits = mainBranch.commits;

    for (const branch of featureBranches) {
      const side: 'left' | 'right' = sideToggle % 2 === 0 ? 'left' : 'right';
      sideToggle++;

      const branchPoint = this.findBranchPoint(branch, mainCommits, mainLayout, baseY, trunkHeight);
      const branchLayout = this.buildFeatureBranch(branch, branchPoint, side, mainLayout.commits.length);

      if (branchLayout) {
        branchLayouts.push(branchLayout);
      }
    }

    const maxDepth = Math.max(...branchLayouts.map(b => b.depth));

    this.assignLeafPositions(branchLayouts);
    this.assignFruits(branchLayouts, data);
    this.assignFlowers(branchLayouts, data);

    const totalLeaves = branchLayouts.reduce((acc, b) => acc + b.leaves.length, 0);

    return {
      branches: branchLayouts,
      width: 800,
      height: Math.max(600, trunkHeight + 120),
      viewBox: `0 0 800 ${Math.max(600, trunkHeight + 120)}`,
      trunkTip,
      trunkBase: { x: baseX, y: baseY },
      maxDepth,
      totalLeaves,
    };
  }

  private buildMainBranch(branch: GitBranch, baseX: number, baseY: number, trunkHeight: number): BranchLayout {
    const commits = [...branch.commits].reverse();
    const path: Vec2[] = [];
    const controlPoints: Vec2[] = [];
    const branchCommits: CommitLayout[] = [];
    const leaves: LeafLayout[] = [];

    const trunkWidth = Math.max(8, Math.min(24, commits.length * 0.3));

    for (let i = 0; i < commits.length; i++) {
      const t = commits.length > 1 ? i / (commits.length - 1) : 0;
      const y = baseY - t * trunkHeight;
      const sway = Math.sin(t * Math.PI * 2 * 3) * (1 - t) * 4;
      const x = baseX + sway;

      const commit = commits[i];
      const cl: CommitLayout = {
        hash: commit.hash,
        message: commit.message,
        author: commit.author,
        date: commit.date,
        position: { x, y },
        size: 0,
        color: '',
        rotation: 0,
        opacity: 1,
        filesChanged: 0,
        isMerge: commit.isMerge,
        isHead: i === commits.length - 1,
      };
      branchCommits.push(cl);

      const leafSize = clamp(6 + Math.sqrt(cl.filesChanged || 1) * 2, 4, 16);
      const leafColor = this.getLeafColor(t, 'oak');
      leaves.push({
        id: `leaf-${commit.hash.substring(0, 7)}`,
        commit,
        position: { x, y },
        size: leafSize,
        color: leafColor,
        rotation: Math.random() * 360,
        opacity: 0.9,
        swayPhase: Math.random() * Math.PI * 2,
        shape: 'oval',
      });

      path.push({ x, y });
    }

    const tipThickness = Math.max(2, trunkWidth * 0.15);
    const branchLayout: BranchLayout = {
      id: 'trunk',
      name: branch.name,
      path,
      controlPoints,
      angle: -90,
      length: trunkHeight,
      thickness: trunkWidth,
      baseThickness: trunkWidth,
      tipThickness,
      color: '#5D4037',
      opacity: 1,
      commits: branchCommits,
      startCommit: commits[0] || null,
      endCommit: commits[commits.length - 1] || null,
      isMain: true,
      isCurrent: branch.isCurrent,
      isStale: branch.isStale,
      depth: 0,
      side: 'right',
      branchPoint: path[0],
      leaves,
      fruits: [],
      flowers: [],
    };

    return branchLayout;
  }

  private findBranchPoint(branch: GitBranch, mainCommits: GitCommit[], mainLayout: BranchLayout, baseY: number, trunkHeight: number): Vec2 {
    if (!branch.baseCommit) return mainLayout.path[0];
    const idx = mainCommits.findIndex(c => c.hash === branch.baseCommit);
    if (idx < 0) return mainLayout.path[Math.floor(mainLayout.path.length / 2)];
    const t = mainCommits.length > 1 ? idx / (mainCommits.length - 1) : 0;
    const y = baseY - t * trunkHeight;
    const sway = Math.sin(t * Math.PI * 2 * 3) * (1 - t) * 4;
    return { x: 400 + sway, y };
  }

  private buildFeatureBranch(branch: GitBranch, branchPoint: Vec2, side: 'left' | 'right', mainCommitCount: number): BranchLayout | null {
    const commits = [...branch.commits].reverse();
    if (commits.length === 0) return null;

    const depth = 1;
    const baseAngle = side === 'left' ? 210 : -30;
    const angleVariation = clamp(commits.length * 0.5, 5, 20);
    const angle = baseAngle + (side === 'left' ? -angleVariation : angleVariation);

    const branchLength = clamp(commits.length * 8, 40, 300);
    const rad = degToRad(angle);
    const endX = branchPoint.x + Math.cos(rad) * branchLength;
    const endY = branchPoint.y + Math.sin(rad) * branchLength;

    const path: Vec2[] = [];
    const branchCommits: CommitLayout[] = [];
    const leaves: LeafLayout[] = [];

    for (let i = 0; i < commits.length; i++) {
      const t = commits.length > 1 ? i / (commits.length - 1) : 0;
      const x = lerp(branchPoint.x, endX, t);
      const y = lerp(branchPoint.y, endY, t);
      const curve = Math.sin(t * Math.PI) * 8 * (side === 'left' ? -1 : 1);
      const px = x + curve;
      const py = y - t * 3;

      const commit = commits[i];
      const cl: CommitLayout = {
        hash: commit.hash,
        message: commit.message,
        author: commit.author,
        date: commit.date,
        position: { x: px, y: py },
        size: 0,
        color: '',
        rotation: 0,
        opacity: 1,
        filesChanged: 0,
        isMerge: commit.isMerge,
        isHead: i === commits.length - 1,
      };
      branchCommits.push(cl);

      const leafSize = clamp(5 + Math.sqrt(cl.filesChanged || 1) * 1.5, 3, 14);
      const leafColor = this.getLeafColor(t, 'oak');
      leaves.push({
        id: `leaf-${commit.hash.substring(0, 7)}`,
        commit,
        position: { x: px, y: py },
        size: leafSize,
        color: leafColor,
        rotation: Math.random() * 360,
        opacity: 0.9,
        swayPhase: Math.random() * Math.PI * 2,
        shape: 'oval',
      });

      path.push({ x: px, y: py });
    }

    const thickness = Math.max(2, 8 - depth * 1.5);
    const branchLayout: BranchLayout = {
      id: `branch-${branch.name}`,
      name: branch.name,
      path,
      controlPoints: [],
      angle,
      length: branchLength,
      thickness,
      baseThickness: thickness,
      tipThickness: Math.max(1, thickness * 0.4),
      color: '#6D4C41',
      opacity: 0.9,
      commits: branchCommits,
      startCommit: commits[0] || null,
      endCommit: commits[commits.length - 1] || null,
      isMain: false,
      isCurrent: branch.isCurrent,
      isStale: branch.isStale,
      depth,
      side,
      branchPoint,
      leaves,
      fruits: [],
      flowers: [],
    };

    return branchLayout;
  }

  private assignLeafPositions(branches: BranchLayout[]): void {
    for (const branch of branches) {
      for (const leaf of branch.leaves) {
        const offsetX = (Math.random() - 0.5) * 6;
        const offsetY = (Math.random() - 0.5) * 4;
        leaf.position = {
          x: leaf.position.x + offsetX,
          y: leaf.position.y + offsetY,
        };
        leaf.rotation = Math.random() * 360;
        leaf.swayPhase = Math.random() * Math.PI * 2;

        const shapes: LeafLayout['shape'][] = ['oval', 'heart', 'round', 'long'];
        leaf.shape = shapes[Math.floor(Math.random() * shapes.length)];
      }
    }
  }

  private assignFruits(branches: BranchLayout[], data: GitData): void {
    for (const branch of branches) {
      if (branch.endCommit) {
        const pos = branch.path[branch.path.length - 1];
        branch.fruits.push({
          id: `fruit-${branch.name}`,
          position: { x: pos.x + (branch.side === 'left' ? -8 : 8), y: pos.y - 4 },
          size: 10,
          color: '#4CAF50',
          type: 'merged',
          label: branch.name,
        });
      }
    }
  }

  private assignFlowers(branches: BranchLayout[], data: GitData): void {
    let flowerCount = 0;
    for (const branch of branches) {
      for (const commit of branch.commits) {
        if (commit.isMerge && flowerCount < 5) {
          branch.flowers.push({
            id: `flower-${commit.hash.substring(0, 7)}`,
            position: { x: commit.position.x + (Math.random() - 0.5) * 12, y: commit.position.y - 4 },
            size: 8,
            color: '#FF8A65',
            petalColor: '#FFAB91',
            centerColor: '#FFE0B2',
            label: commit.hash.substring(0, 7),
            bloomProgress: 1,
          });
          flowerCount++;
        }
      }
    }
  }

  private getLeafColor(t: number, _theme: string): string {
    if (t < 0.2) return '#66BB6A';
    if (t < 0.5) return '#43A047';
    if (t < 0.8) return '#2E7D32';
    return '#1B5E20';
  }
}
