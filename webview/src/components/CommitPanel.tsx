import React from 'react';
import { useTreeStore } from '../store/treeStore';
import { LeafIcon, CopyIcon, ExternalLinkIcon, MergeIcon, CloseIcon, CommitIcon } from './Icons';

export function CommitPanel() {
  const { selectedCommit, selectCommit, theme } = useTreeStore();

  if (!selectedCommit) {
    return (
      <div className="panel-empty">
        <LeafIcon color={theme.accent} />
        <p>Click a leaf to see commit details</p>
      </div>
    );
  }

  const commit = selectedCommit;
  const date = new Date(commit.date);
  const shortHash = commit.hash.substring(0, 7);

  return (
    <div className="panel commit-panel" style={{ borderLeftColor: theme.accent }}>
      <div className="panel-header">
        <CommitIcon color={theme.accent} />
        <span className="panel-title">Commit</span>
        <button className="panel-close" onClick={() => selectCommit(null)}><CloseIcon size={14} /></button>
      </div>

      <div className="panel-body">
        <div className="commit-hash" onClick={() => {
          const vscode = (window as any).acquireVsCodeApi?.();
          vscode?.postMessage({ type: 'copyHash', hash: commit.hash });
        }} style={{ cursor: 'pointer' }}>
          <code>{shortHash}</code>
          <span className="copy-hint"><CopyIcon size={12} /></span>
        </div>

        <div className="commit-message">{commit.message}</div>

        <div className="commit-meta">
          <div className="meta-row">
            <span className="meta-label">Author</span>
            <span className="meta-value">{commit.author}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Date</span>
            <span className="meta-value">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Files</span>
            <span className="meta-value">{commit.filesChanged} changed</span>
          </div>
          {commit.isMerge && (
            <div className="meta-row">
              <span className="meta-label">Type</span>
              <span className="meta-value merge-badge"><MergeIcon size={12} color="#FFB300" /> Merge</span>
            </div>
          )}
        </div>

        <button
          className="panel-action"
          onClick={() => {
            const vscode = (window as any).acquireVsCodeApi?.();
            vscode?.postMessage({ type: 'openCommit', hash: commit.hash });
          }}
        >
          <ExternalLinkIcon size={12} /> Open in Editor
        </button>
      </div>
    </div>
  );
}
