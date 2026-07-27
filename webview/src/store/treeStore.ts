import { create } from 'zustand';
import { GitData, TreeLayout3D, TreeTheme, ThemeName, ViewMode, GitCommit, TreeSettings } from '@shared/types';
import { getTheme } from '../theme/themes';
import { computeTreeLayout3D } from '../layout/treeLayout3D';

interface VSCodeAPI {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VSCodeAPI;

const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

interface TreeState {
  treeData: GitData | null;
  layout: TreeLayout3D | null;
  theme: TreeTheme;
  themeName: ThemeName;
  viewMode: ViewMode;
  selectedCommit: GitCommit | null;
  hoveredCommit: GitCommit | null;
  hoverScreen: { x: number; y: number } | null;
  loading: boolean;
  error: string | null;
  settings: TreeSettings;
  replayProgress: number;
  isReplaying: boolean;
  setTreeData: (data: GitData) => void;
  setTheme: (theme: ThemeName) => void;
  setViewMode: (mode: ViewMode) => void;
  selectCommit: (commit: GitCommit | null) => void;
  setHoveredCommit: (commit: GitCommit | null) => void;
  setHoverScreen: (pos: { x: number; y: number } | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<TreeSettings>) => void;
  setReplayProgress: (progress: number) => void;
  setIsReplaying: (replaying: boolean) => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  treeData: null,
  layout: null,
  theme: getTheme('oak'),
  themeName: 'oak',
  viewMode: 'living',
  selectedCommit: null,
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

  setTreeData: (data) => {
    const theme = get().theme;
    const layout = computeTreeLayout3D(data, theme);
    set({ treeData: data, layout, loading: false, error: null, replayProgress: 1 });
  },

  setTheme: (themeName) => {
    const theme = getTheme(themeName);
    const data = get().treeData;
    const layout = data ? computeTreeLayout3D(data, theme) : get().layout;
    set({
      themeName,
      theme,
      layout,
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

  selectCommit: (commit) => set({ selectedCommit: commit }),
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
