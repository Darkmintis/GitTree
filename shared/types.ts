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

export interface Vec2 {
  x: number;
  y: number;
}

export interface CommitLayout {
  hash: string;
  message: string;
  author: string;
  date: Date;
  position: Vec2;
  size: number;
  color: string;
  rotation: number;
  opacity: number;
  filesChanged: number;
  isMerge: boolean;
  isHead: boolean;
}

export interface BranchLayout {
  id: string;
  name: string;
  path: Vec2[];
  controlPoints: Vec2[];
  angle: number;
  length: number;
  thickness: number;
  baseThickness: number;
  tipThickness: number;
  color: string;
  opacity: number;
  commits: CommitLayout[];
  startCommit: GitCommit | null;
  endCommit: GitCommit | null;
  isMain: boolean;
  isCurrent: boolean;
  isStale: boolean;
  depth: number;
  side: 'left' | 'right';
  branchPoint: Vec2;
  leaves: LeafLayout[];
  fruits: FruitLayout[];
  flowers: FlowerLayout[];
}

export interface LeafLayout {
  id: string;
  commit: GitCommit;
  position: Vec2;
  size: number;
  color: string;
  rotation: number;
  opacity: number;
  swayPhase: number;
  shape: 'oval' | 'heart' | 'round' | 'long';
}

export interface FruitLayout {
  id: string;
  position: Vec2;
  size: number;
  color: string;
  type: 'open' | 'merged' | 'closed';
  label: string;
}

export interface FlowerLayout {
  id: string;
  position: Vec2;
  size: number;
  color: string;
  petalColor: string;
  centerColor: string;
  label: string;
  bloomProgress: number;
}

export interface TreeLayout {
  branches: BranchLayout[];
  width: number;
  height: number;
  viewBox: string;
  trunkTip: Vec2;
  trunkBase: Vec2;
  maxDepth: number;
  totalLeaves: number;
}

export type ThemeName =
  | 'oak'
  | 'sakura'
  | 'pine'
  | 'maple'
  | 'fantasy'
  | 'cyber'
  | 'pixel'
  | 'minimal'
  | 'darkForest'
  | 'crystal'
  | 'bonsai';

export interface TreeTheme {
  name: ThemeName;
  label: string;
  trunk: { primary: string; secondary: string; gradient: string[] };
  branch: { primary: string; secondary: string; gradient: string[] };
  leaves: {
    recent: string;
    young: string;
    mature: string;
    old: string;
    stale: string;
    gradient: string[];
  };
  flowers: {
    petal: string;
    center: string;
    gradient: string[];
  };
  fruits: {
    open: string;
    merged: string;
    closed: string;
  };
  background: {
    primary: string;
    secondary: string;
    gradient: boolean;
    sky: string[];
    ground: string[];
  };
  ground: string;
  effects: {
    particles: string;
    glow: string;
    wind: boolean;
  };
  accent: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
}

export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  centerX: number;
  centerY: number;
}

export type ViewMode = 'living' | 'explorer' | 'replay';

export interface TreeSettings {
  animationSpeed: number;
  theme: ThemeName;
  showLeaves: boolean;
  showFruits: boolean;
  showFlowers: boolean;
  particleEffects: boolean;
  windEnabled: boolean;
  performanceMode: boolean;
}

export interface TreeStore {
  treeData: GitData | null;
  treeLayout: TreeLayout | null;
  theme: TreeTheme;
  themeName: ThemeName;
  viewState: ViewState;
  viewMode: ViewMode;
  selectedCommit: GitCommit | null;
  selectedBranch: GitBranch | null;
  hoveredCommit: GitCommit | null;
  loading: boolean;
  error: string | null;
  settings: TreeSettings;
  replayProgress: number;
  isReplaying: boolean;
}
