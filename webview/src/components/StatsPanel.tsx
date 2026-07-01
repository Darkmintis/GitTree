import React from 'react';
import { useTreeStore } from '../store/treeStore';
import { ChartIcon, CommitIcon, ForkIcon, PeopleIcon, HeartIcon, TreeIcon, ClockIcon } from './Icons';

export function StatsPanel() {
  const { treeData, treeLayout, theme } = useTreeStore();

  if (!treeData) return null;

  const daysSinceFirst = Math.max(1, Math.floor(treeData.repositoryAge / (1000 * 60 * 60 * 24)));
  const branchCount = treeData.branches.length;
  const staleBranches = treeData.branches.filter(b => b.isStale).length;
  const leafCount = treeLayout?.totalLeaves || 0;

  const isHealthy = staleBranches <= branchCount * 0.5 && leafCount > 15;
  const healthLabel = staleBranches > branchCount * 0.5 ? 'Inactive' : leafCount > 20 ? 'Healthy' : 'Growing';
  const healthColor = staleBranches > branchCount * 0.5 ? '#F57F17' : leafCount > 20 ? theme.accent : '#A5D6A7';

  return (
    <div className="stats-panel" style={{ borderColor: theme.accent }}>
      <div className="stats-header"><ChartIcon color={theme.accent} /> Repository Health</div>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-num">{treeData.totalCommits}</span>
          <span className="stat-desc"><CommitIcon size={10} /> Commits</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{branchCount}</span>
          <span className="stat-desc"><ForkIcon size={10} /> Branches</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{treeData.totalContributors}</span>
          <span className="stat-desc"><PeopleIcon size={10} /> Contributors</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{daysSinceFirst}d</span>
          <span className="stat-desc"><ClockIcon size={10} /> Age</span>
        </div>
      </div>
      <div className="health-indicator" style={{ color: healthColor }}>
        <HeartIcon size={12} color={healthColor} /> {healthLabel}
      </div>
    </div>
  );
}
