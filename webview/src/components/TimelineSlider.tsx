import React from 'react';
import { useTreeStore } from '../store/treeStore';
import { useAnimation } from '../hooks/useAnimation';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon } from './Icons';

export function TimelineSlider() {
  const { viewMode, replayProgress, setReplayProgress, isReplaying } = useTreeStore();
  const { startReplay, stopReplay } = useAnimation();

  if (viewMode !== 'replay') return null;

  return (
    <div className="timeline-slider">
      <button
        className="timeline-btn"
        onClick={isReplaying ? stopReplay : startReplay}
        title={isReplaying ? 'Pause' : 'Play'}
      >
        {isReplaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.001"
        value={replayProgress}
        onChange={(e) => setReplayProgress(parseFloat(e.target.value))}
        className="timeline-range"
      />
      <span className="timeline-label">{Math.round(replayProgress * 100)}%</span>
      <button className="timeline-btn" onClick={() => setReplayProgress(0)} title="Skip to Start">
        <SkipBackIcon size={14} />
      </button>
      <button className="timeline-btn" onClick={() => setReplayProgress(1)} title="Skip to End">
        <SkipForwardIcon size={14} />
      </button>
    </div>
  );
}
