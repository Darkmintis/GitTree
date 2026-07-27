import { create } from 'zustand';
import {
  GitData,
  TreeLayout3D,
  TreeTheme,
  ThemeName,
  ViewMode,
  GitCommit,
  TreeSettings,
  RepoGitData,
  PlacedTree,
} from '@shared/types';
import { getTheme } from '../theme/themes';
import { computeTreeLayout3D } from '../layout/treeLayout3D';
import { earthSurfaceAt } from '../scene/PlanetEarth';

interface VSCodeAPI {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VSCodeAPI;

const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

function placeTrees(repos: RepoGitData[], theme: TreeTheme): PlacedTree[] {
  const n = repos.length;
  if (n === 0) return [];

  return repos.map((repo, i) => {
    const layout = computeTreeLayout3D(repo.data, theme);
    let x = 0;
    let z = 0;
    if (n > 1) {
      const ring = Math.min(9, 3.2 + n * 1.05);
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      x = Math.cos(angle) * ring;
      z = Math.sin(angle) * ring;
    }
    // Plant into the planet surface so the trunk roots into the ground
    const { y } = earthSurfaceAt(x, z);
    return {
      id: repo.id,
      name: repo.name,
      path: repo.path,
      data: repo.data,
      layout,
      position: { x, y: y - 0.12, z },
    };
  });
}

interface TreeState {
  trees: PlacedTree[];
  /** Aggregate / primary tree data for HUD stats */
  treeData: GitData | null;
  layout: TreeLayout3D | null;
  theme: TreeTheme;
  themeName: ThemeName;
  viewMode: ViewMode;
  selectedCommit: GitCommit | null;
  selectedRepoPath: string | null;
  hoveredCommit: GitCommit | null;
  hoverScreen: { x: number; y: number } | null;
  loading: boolean;
  error: string | null;
  settings: TreeSettings;
  replayProgress: number;
  isReplaying: boolean;
  setRepos: (repos: RepoGitData[]) => void;
  setTreeData: (data: GitData) => void;
  setTheme: (theme: ThemeName) => void;
  setViewMode: (mode: ViewMode) => void;
  selectCommit: (commit: GitCommit | null, repoPath?: string | null) => void;
  setHoveredCommit: (commit: GitCommit | null) => void;
  setHoverScreen: (pos: { x: number; y: number } | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<TreeSettings>) => void;
  setReplayProgress: (progress: number) => void;
  setIsReplaying: (replaying: boolean) => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  trees: [],
  treeData: null,
  layout: null,
  theme: getTheme('oak'),
  themeName: 'oak',
  viewMode: 'living',
  selectedCommit: null,
  selectedRepoPath: null,
  hoveredCommit: null,
  hoverScreen: null,
  loading: true,
  error: null,
  settings: {
    animationSpeed: 1,
    theme: 'oak',
    showLeaves: true,
    showFruits: true,
    showFlowers: true,
    windEnabled: true,
    performanceMode: false,
  },
  replayProgress: 1,
  isReplaying: false,

  setRepos: (repos) => {
    const theme = get().theme;
    const trees = placeTrees(repos, theme);
    const primary = trees[0] || null;
    set({
      trees,
      treeData: primary?.data ?? null,
      layout: primary?.layout ?? null,
      loading: false,
      error: trees.length ? null : 'No Git repositories found',
      replayProgress: 1,
    });
  },

  setTreeData: (data) => {
    get().setRepos([{ id: 'local', name: 'repository', path: '', data }]);
  },

  setTheme: (themeName) => {
    const theme = getTheme(themeName);
    const trees = get().trees.map((t) => ({
      ...t,
      layout: computeTreeLayout3D(t.data, theme),
    }));
    set({
      themeName,
      theme,
      trees,
      layout: trees[0]?.layout ?? null,
      settings: { ...get().settings, theme: themeName },
    });
    vscode?.postMessage({ type: 'themeChanged', theme: themeName });
  },

  setViewMode: (viewMode) => {
    if (viewMode === 'replay') {
      set({ viewMode, replayProgress: 0, isReplaying: true });
    } else {
      set({ viewMode, replayProgress: 1, isReplaying: false });
    }
  },

  selectCommit: (commit, repoPath = null) =>
    set({ selectedCommit: commit, selectedRepoPath: commit ? repoPath : null }),
  setHoveredCommit: (commit) => set({ hoveredCommit: commit, hoverScreen: commit ? get().hoverScreen : null }),
  setHoverScreen: (pos) => set({ hoverScreen: pos }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),

  updateSettings: (settings) => {
    set((prev) => ({ settings: { ...prev.settings, ...settings } }));
  },

  setReplayProgress: (progress) => {
    const clamped = Math.max(0, Math.min(1, progress));
    set({
      replayProgress: clamped,
      isReplaying: clamped < 1 ? get().isReplaying : false,
    });
  },

  setIsReplaying: (replaying) => set({ isReplaying: replaying }),
}));

export { vscode };
