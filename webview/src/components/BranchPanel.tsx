import React from 'react';
import { useTreeStore } from '../store/treeStore';
import { ForkIcon, CloseIcon } from './Icons';

export function BranchPanel() {
  const { selectedBranch, selectBranch, treeData, theme } = useTreeStore();

  if (!selectedBranch) {
    return (
      <div className="panel-empty">
        <ForkIcon color={theme.accent} />
        <p>Click a branch to see details</p>
      </div>
    );
  }

  const branch = selectedBranch;
  const daysSinceLastCommit = Math.floor(
    (Date.now() - new Date(branch.lastCommitAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="panel branch-panel" style={{ borderLeftColor: theme.accent }}>
      <div className="panel-header">
        <ForkIcon color={theme.accent} />
        <span className="panel-title">Branch</span>
        <button className="panel-close" onClick={() => selectBranch(null)}><CloseIcon size={14} /></button>
      </div>

      <div className="panel-body">
        <div className="branch-name">{branch.name}</div>

        <div className="branch-indicators">
          {branch.isMain && <span className="badge main-badge">Main</span>}
          {branch.isCurrent && <span className="badge current-badge">HEAD</span>}
          {branch.isStale && <span className="badge stale-badge">Stale</span>}
          {branch.isRemote && <span className="badge remote-badge">Remote</span>}
        </div>

        <div className="commit-meta">
          <div className="meta-row">
            <span className="meta-label">Commits</span>
            <span className="meta-value">{branch.commits.length}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Last commit</span>
            <span className="meta-value">{daysSinceLastCommit}d ago</span>
          </div>
          {branch.parentBranch && (
            <div className="meta-row">
              <span className="meta-label">Parent</span>
              <span className="meta-value">{branch.parentBranch}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
