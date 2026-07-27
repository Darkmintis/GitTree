export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  authorEmail: string;
  date: Date;
  filesChanged: number;
  insertions: number;
  deletions: number;
  branch: string;
  refs: string[];
  isMerge: boolean;
  parents: string[];
}

export interface GitBranch {
  name: string;
  commits: GitCommit[];
  parentBranch: string | null;
  isMain: boolean;
  isCurrent: boolean;
  isStale: boolean;
  isDeleted: boolean;
  isRemote: boolean;
  baseCommit: string | null;
  mergeCommit: string | null;
  createdAt: Date;
  lastCommitAt: Date;
}

export interface GitTag {
  name: string;
  commitHash: string;
  date: Date;
  isRelease: boolean;
}

export interface GitData {
  branches: GitBranch[];
  tags: GitTag[];
  currentBranch: string;
  totalCommits: number;
  totalBranches: number;
  totalContributors: number;
  repositoryAge: number;
  avgCommitsPerDay: number;
  firstCommitDate: Date;
  lastCommitDate: Date;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface LeafInstance {
  id: string;
  commit: GitCommit;
  /** Point on the branch/trunk surface where the stem starts */
  attachPoint: Vec3;
  /** Leaf blade center */
  position: Vec3;
  /** Outward direction from wood through the leaf */
  normal: Vec3;
  scale: number;
  color: string;
  rotation: number;
  swayPhase: number;
  appearAt: number;
  interactive: boolean;
}

export interface BranchSegment3D {
  id: string;
  name: string;
  points: Vec3[];
  radius: number;
  tipRadius: number;
  isMain: boolean;
  isCurrent: boolean;
  appearAt: number;
  color: string;
}

export interface Decoration3D {
  id: string;
  /** Where stem attaches to wood */
  attachPoint: Vec3;
  position: Vec3;
  scale: number;
  color: string;
  type: 'fruit' | 'flower';
  label: string;
  appearAt: number;
  commit?: GitCommit;
}

export interface TreeLayout3D {
  branches: BranchSegment3D[];
  leaves: LeafInstance[];
  decorations: Decoration3D[];
  trunkHeight: number;
  canopyRadius: number;
  totalLeaves: number;
}

export type ThemeName = 'oak' | 'sakura' | 'pine';

export interface TreeTheme {
  name: ThemeName;
  label: string;
  trunk: { primary: string; secondary: string };
  branch: { primary: string; secondary: string };
  leaves: {
    recent: string;
    young: string;
    mature: string;
    old: string;
    stale: string;
  };
  flowers: { petal: string; center: string };
  fruits: { open: string; merged: string; closed: string };
  ground: string;
  grass: string;
  sky: { turbidity: number; rayleigh: number; mieCoefficient: number; sunPosition: [number, number, number] };
  accent: string;
  text: { primary: string; secondary: string; muted: string };
  overlay: { bg: string; border: string };
}

export type ViewMode = 'living' | 'replay';

export interface TreeSettings {
  animationSpeed: number;
  theme: ThemeName;
  showLeaves: boolean;
  showFruits: boolean;
  showFlowers: boolean;
  windEnabled: boolean;
  performanceMode: boolean;
}
