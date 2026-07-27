import React from 'react';
import { useTreeStore } from '../store/treeStore';
import { getAllThemes } from '../theme/themes';
import { ThemeName } from '@shared/types';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, CloseIcon, CopyIcon, ExternalLinkIcon, TreeIcon } from './Icons';

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function postToHost(message: unknown) {
  const vscode = (window as unknown as { acquireVsCodeApi?: () => { postMessage: (m: unknown) => void } }).acquireVsCodeApi?.();
  vscode?.postMessage(message);
}

export function Overlay() {
  const theme = useTreeStore((s) => s.theme);
  const themeName = useTreeStore((s) => s.themeName);
  const setTheme = useTreeStore((s) => s.setTheme);
  const viewMode = useTreeStore((s) => s.viewMode);
  const setViewMode = useTreeStore((s) => s.setViewMode);
  const settings = useTreeStore((s) => s.settings);
  const updateSettings = useTreeStore((s) => s.updateSettings);
  const treeData = useTreeStore((s) => s.treeData);
  const trees = useTreeStore((s) => s.trees);
  const replayProgress = useTreeStore((s) => s.replayProgress);
  const isReplaying = useTreeStore((s) => s.isReplaying);
  const setReplayProgress = useTreeStore((s) => s.setReplayProgress);
  const setIsReplaying = useTreeStore((s) => s.setIsReplaying);
  const selectedCommit = useTreeStore((s) => s.selectedCommit);
  const selectedRepoPath = useTreeStore((s) => s.selectedRepoPath);
  const selectCommit = useTreeStore((s) => s.selectCommit);
  const hoveredCommit = useTreeStore((s) => s.hoveredCommit);
  const hoverScreen = useTreeStore((s) => s.hoverScreen);

  const themes = getAllThemes();
  const totalCommits = trees.reduce((n, t) => n + t.data.totalCommits, 0);
  const totalLeaves = trees.reduce((n, t) => n + t.layout.totalLeaves, 0);
  const selectedRepo = trees.find((t) => t.path === selectedRepoPath || t.id === selectedRepoPath);

  return (
    <div className="overlay" style={{ ['--accent' as string]: theme.accent }}>
      <header className="overlay-top">
        <div className="brand" style={{ background: theme.overlay.bg, borderColor: theme.overlay.border }}>
          <TreeIcon color={theme.accent} size={18} />
          <div>
            <strong>GitTree</strong>
            {treeData && (
              <span className="brand-meta">
                {trees.length > 1 ? `${trees.length} repos · ` : ''}
                {totalCommits} commits · {trees.reduce((n, t) => n + t.data.totalBranches, 0)} branches
                {totalLeaves ? ` · ${totalLeaves} leaves` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="controls" style={{ background: theme.overlay.bg, borderColor: theme.overlay.border }}>
          <div className="control-group">
            {themes.map(([name, t]) => (
              <button
                key={name}
                className={`chip ${themeName === name ? 'active' : ''}`}
                onClick={() => setTheme(name as ThemeName)}
                title={t.label}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="control-group">
            <button className={`chip ${viewMode === 'living' ? 'active' : ''}`} onClick={() => setViewMode('living')}>
              Living
            </button>
            <button className={`chip ${viewMode === 'replay' ? 'active' : ''}`} onClick={() => setViewMode('replay')}>
              Replay
            </button>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.windEnabled}
              onChange={(e) => updateSettings({ windEnabled: e.target.checked })}
            />
            Wind
          </label>
        </div>
      </header>

      {viewMode === 'replay' && (
        <div className="replay-bar" style={{ background: theme.overlay.bg, borderColor: theme.overlay.border }}>
          <button
            className="icon-btn"
            onClick={() => {
              if (isReplaying) setIsReplaying(false);
              else {
                if (replayProgress >= 1) setReplayProgress(0);
                setIsReplaying(true);
              }
            }}
            title={isReplaying ? 'Pause' : 'Play'}
          >
            {isReplaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={replayProgress}
            onChange={(e) => {
              setIsReplaying(false);
              setReplayProgress(parseFloat(e.target.value));
            }}
          />
          <span className="replay-pct">{Math.round(replayProgress * 100)}%</span>
          <button className="icon-btn" onClick={() => { setIsReplaying(false); setReplayProgress(0); }} title="Start">
            <SkipBackIcon size={14} />
          </button>
          <button className="icon-btn" onClick={() => { setIsReplaying(false); setReplayProgress(1); }} title="End">
            <SkipForwardIcon size={14} />
          </button>
        </div>
      )}

      {hoveredCommit && hoverScreen && !selectedCommit && (
        <div
          className="leaf-tooltip"
          style={{
            left: Math.min(hoverScreen.x + 14, window.innerWidth - 280),
            top: Math.max(12, hoverScreen.y - 10),
            background: theme.overlay.bg,
            borderColor: theme.overlay.border,
          }}
        >
          <div className="tooltip-hash">{hoveredCommit.hash.substring(0, 7)}</div>
          <div className="tooltip-msg">{hoveredCommit.message}</div>
          <div className="tooltip-hint">Click for full details</div>
        </div>
      )}

      {selectedCommit && (
        <aside className="commit-card" style={{ background: theme.overlay.bg, borderColor: theme.overlay.border }}>
          <div className="commit-card-header">
            <code className="hash" onClick={() => postToHost({ type: 'copyHash', hash: selectedCommit.hash })}>
              {selectedCommit.hash.substring(0, 7)}
              <CopyIcon size={12} />
            </code>
            <button className="icon-btn" onClick={() => selectCommit(null)}>
              <CloseIcon size={14} />
            </button>
          </div>

          <p className="commit-msg">{selectedCommit.message}</p>

          <div className="commit-details">
            {selectedRepo && (
              <div className="detail-row">
                <span className="detail-label">Repo</span>
                <span className="detail-value">{selectedRepo.name}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Author</span>
              <span className="detail-value">{selectedCommit.author}</span>
            </div>
            {selectedCommit.authorEmail && (
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value muted">{selectedCommit.authorEmail}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">When</span>
              <span className="detail-value">{formatDate(selectedCommit.date)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Branch</span>
              <span className="detail-value">{selectedCommit.branch}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Files</span>
              <span className="detail-value">{selectedCommit.filesChanged} changed</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Diff</span>
              <span className="detail-value">
                <span className="ins">+{selectedCommit.insertions}</span>
                {' · '}
                <span className="del">-{selectedCommit.deletions}</span>
              </span>
            </div>
            {selectedCommit.isMerge && (
              <div className="detail-row">
                <span className="detail-label">Type</span>
                <span className="detail-value merge-pill">Merge commit</span>
              </div>
            )}
            {selectedCommit.refs?.length > 0 && (
              <div className="detail-row">
                <span className="detail-label">Refs</span>
                <span className="detail-value">{selectedCommit.refs.join(', ')}</span>
              </div>
            )}
          </div>

          <button
            className="open-btn"
            onClick={() =>
              postToHost({
                type: 'openCommit',
                hash: selectedCommit.hash,
                repoPath: selectedRepoPath,
              })
            }
          >
            <ExternalLinkIcon size={12} /> Open in Editor
          </button>
        </aside>
      )}

      <footer className="hint">Drag to orbit · Scroll to zoom · Hover a leaf for message · Click for details</footer>
    </div>
  );
}
