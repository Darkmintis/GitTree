import React from 'react';
import { useTreeStore } from '../store/treeStore';
import { getAllThemes } from '../theme/themes';
import { TreeIcon, CommitIcon, BranchIcon, PeopleIcon, CameraIcon } from './Icons';

export function Sidebar() {
  const { treeData, theme, themeName, setTheme, viewMode, setViewMode, settings, updateSettings } = useTreeStore();

  if (!treeData) return null;

  const themes = getAllThemes();

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">
          <TreeIcon color={theme.accent} /> GitTree
        </div>
        <div className="tree-stats">
          <div className="stat-row">
            <span className="stat-icon"><CommitIcon color={theme.accent} /></span>
            <span className="stat-label">Commits</span>
            <span className="stat-value">{treeData.totalCommits}</span>
          </div>
          <div className="stat-row">
            <span className="stat-icon"><BranchIcon color={theme.accent} /></span>
            <span className="stat-label">Branches</span>
            <span className="stat-value">{treeData.totalBranches}</span>
          </div>
          <div className="stat-row">
            <span className="stat-icon"><PeopleIcon color={theme.accent} /></span>
            <span className="stat-label">Contributors</span>
            <span className="stat-value">{treeData.totalContributors}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-subtitle">View Mode</div>
        <div className="mode-buttons">
          <button
            className={`mode-btn ${viewMode === 'living' ? 'active' : ''}`}
            onClick={() => setViewMode('living')}
          >
            <TreeIcon size={12} /> Living
          </button>
          <button
            className={`mode-btn ${viewMode === 'explorer' ? 'active' : ''}`}
            onClick={() => setViewMode('explorer')}
          >
            <CommitIcon size={12} /> Explorer
          </button>
          <button
            className={`mode-btn ${viewMode === 'replay' ? 'active' : ''}`}
            onClick={() => setViewMode('replay')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg> Replay
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-subtitle">Theme</div>
        <select
          className="theme-select"
          value={themeName}
          onChange={(e) => setTheme(e.target.value as any)}
          style={{ borderColor: theme.accent }}
        >
          {themes.map(([name, t]) => (
            <option key={name} value={name}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-subtitle">Settings</div>
        <div className="settings-list">
          <label className="setting-row">
            <span>Show Leaves</span>
            <input
              type="checkbox"
              checked={settings.showLeaves}
              onChange={(e) => updateSettings({ showLeaves: e.target.checked })}
            />
          </label>
          <label className="setting-row">
            <span>Show Fruits</span>
            <input
              type="checkbox"
              checked={settings.showFruits}
              onChange={(e) => updateSettings({ showFruits: e.target.checked })}
            />
          </label>
          <label className="setting-row">
            <span>Show Flowers</span>
            <input
              type="checkbox"
              checked={settings.showFlowers}
              onChange={(e) => updateSettings({ showFlowers: e.target.checked })}
            />
          </label>
          <label className="setting-row">
            <span>Wind</span>
            <input
              type="checkbox"
              checked={settings.windEnabled}
              onChange={(e) => updateSettings({ windEnabled: e.target.checked })}
            />
          </label>
          <label className="setting-row">
            <span>Particles</span>
            <input
              type="checkbox"
              checked={settings.particleEffects}
              onChange={(e) => updateSettings({ particleEffects: e.target.checked })}
            />
          </label>
          <div className="setting-row">
            <span>Speed</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={settings.animationSpeed}
              onChange={(e) => updateSettings({ animationSpeed: parseFloat(e.target.value) })}
              className="speed-slider"
            />
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-subtitle">Export</div>
        <button
          className="export-btn"
          onClick={() => {
            const vscode = (window as any).acquireVsCodeApi?.();
            vscode?.postMessage({ type: 'exportSVG', svg: document.querySelector('.tree-renderer')?.outerHTML });
          }}
        >
          <CameraIcon size={12} /> Export SVG
        </button>
      </div>
    </div>
  );
}
