import { GitData, TreeLayout, TreeTheme, ThemeName, ViewState, ViewMode, GitCommit, GitBranch, TreeSettings } from '@shared/types';
import { create } from 'zustand';
import { getTheme } from '../theme/themes';

interface VSCodeAPI {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

declare function acquireVsCodeApi(): VSCodeAPI;

const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

const defaultTheme: TreeTheme = {
  name: 'oak',
  label: 'Default Oak',
  trunk: { primary: '#5D4037', secondary: '#3E2723', gradient: ['#5D4037', '#4E342E', '#3E2723'] },
  branch: { primary: '#6D4C41', secondary: '#4E342E', gradient: ['#6D4C41', '#5D4037', '#4E342E'] },
  leaves: {
    recent: '#66BB6A',
    young: '#43A047',
    mature: '#2E7D32',
    old: '#827717',
    stale: '#A1887F',
    gradient: ['#66BB6A', '#43A047', '#2E7D32', '#827717', '#A1887F'],
  },
  flowers: { petal: '#FFAB91', center: '#FFE0B2', gradient: ['#FFAB91', '#FFCC80', '#FFE0B2'] },
  fruits: { open: '#FF7043', merged: '#4CAF50', closed: '#9E9E9E' },
  background: { primary: '#1a1a2e', secondary: '#16213e', gradient: true, sky: ['#16213e', '#1a1a2e', '#0D1117'], ground: ['#1B5E20', '#2E7D32', '#388E3C'] },
  ground: '#2E7D32',
  effects: { particles: '#A5D6A7', glow: '#4CAF50', wind: true },
  accent: '#4CAF50',
  text: { primary: '#E8F5E9', secondary: '#A5D6A7', muted: '#616161' },
};

interface TreeState {
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
  setTreeData: (data: GitData, layout: TreeLayout) => void;
  setTheme: (theme: ThemeName) => void;
  setViewState: (state: Partial<ViewState>) => void;
  setViewMode: (mode: ViewMode) => void;
  selectCommit: (commit: GitCommit | null) => void;
  selectBranch: (branch: GitBranch | null) => void;
  setHoveredCommit: (commit: GitCommit | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<TreeSettings>) => void;
  setReplayProgress: (progress: number) => void;
  setIsReplaying: (replaying: boolean) => void;
  reset: () => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  treeData: null,
  treeLayout: null,
  theme: defaultTheme,
  themeName: 'oak',
  viewState: { zoom: 1, panX: 0, panY: 0, rotation: 0, centerX: 400, centerY: 300 },
  viewMode: 'living',
  selectedCommit: null,
  selectedBranch: null,
  hoveredCommit: null,
  loading: true,
  error: null,
  settings: {
    animationSpeed: 1,
    theme: 'oak',
    showLeaves: true,
    showFruits: true,
    showFlowers: true,
    particleEffects: true,
    windEnabled: true,
    performanceMode: false,
  },
  replayProgress: 0,
  isReplaying: false,

  setTreeData: (data, layout) => {
    set({ treeData: data, treeLayout: layout, loading: false, error: null });
  },

  setTheme: (themeName) => {
    const theme = getTheme(themeName);
    set({ themeName, theme });
    vscode?.postMessage({ type: 'themeChanged', theme: themeName });
  },

  setViewState: (state) => {
    set((prev) => ({ viewState: { ...prev.viewState, ...state } }));
  },

  setViewMode: (viewMode) => set({ viewMode }),

  selectCommit: (commit) => set({ selectedCommit: commit, selectedBranch: null }),
  selectBranch: (branch) => set({ selectedBranch: branch, selectedCommit: null }),
  setHoveredCommit: (commit) => set({ hoveredCommit: commit }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),

  updateSettings: (settings) => {
    set((prev) => ({ settings: { ...prev.settings, ...settings } }));
  },

  setReplayProgress: (progress) => set({ replayProgress: progress }),
  setIsReplaying: (replaying) => set({ isReplaying: replaying }),

  reset: () => {
    set({
      treeData: null,
      treeLayout: null,
      loading: true,
      error: null,
      selectedCommit: null,
      selectedBranch: null,
    });
  },
}));
