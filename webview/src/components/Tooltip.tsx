import React from 'react';
import { useTreeStore } from '../store/treeStore';

export function Tooltip() {
  const { hoveredCommit, viewState, theme } = useTreeStore();

  if (!hoveredCommit) return null;

  const date = new Date(hoveredCommit.date);
  const shortHash = hoveredCommit.hash.substring(0, 7);

  return (
    <div
      className="tooltip"
      style={{
        borderColor: theme.accent,
        backgroundColor: theme.background.secondary,
      }}
    >
      <div className="tooltip-header">
        <code>{shortHash}</code>
      </div>
      <div className="tooltip-message">{hoveredCommit.message}</div>
      <div className="tooltip-meta">
        <span>{hoveredCommit.author}</span>
        <span>{date.toLocaleDateString()}</span>
      </div>
    </div>
  );
}
