import React from 'react';
import { useTreeStore } from '../store/treeStore';
import { MinusIcon, PlusIcon, ResetIcon } from './Icons';

export function ZoomControls() {
  const { viewState, setViewState } = useTreeStore();

  const zoomIn = () => setViewState({ zoom: Math.min(5, viewState.zoom * 1.2) });
  const zoomOut = () => setViewState({ zoom: Math.max(0.1, viewState.zoom * 0.8) });
  const reset = () => setViewState({ zoom: 1, rotation: 0 });
  const rotateLeft = () => setViewState({ rotation: viewState.rotation - 15 });
  const rotateRight = () => setViewState({ rotation: viewState.rotation + 15 });

  const zoomPercent = Math.round(viewState.zoom * 100);

  return (
    <div className="zoom-controls">
      <div className="zoom-group">
        <button className="zoom-btn" onClick={zoomOut} title="Zoom Out"><MinusIcon size={14} /></button>
        <span className="zoom-level">{zoomPercent}%</span>
        <button className="zoom-btn" onClick={zoomIn} title="Zoom In"><PlusIcon size={14} /></button>
      </div>
      <div className="zoom-divider" />
      <div className="zoom-group">
        <button className="zoom-btn" onClick={rotateLeft} title="Rotate Left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </button>
        <span className="zoom-level">{viewState.rotation}°</span>
        <button className="zoom-btn" onClick={rotateRight} title="Rotate Right">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>
      <div className="zoom-divider" />
      <button className="zoom-btn zoom-reset" onClick={reset} title="Reset View"><ResetIcon size={13} /></button>
    </div>
  );
}
