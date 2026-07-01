import { useCallback, useRef, useEffect } from 'react';
import { useTreeStore } from '../store/treeStore';

export function useAnimation() {
  const { settings, treeLayout, viewMode, isReplaying, replayProgress, setReplayProgress, setIsReplaying } = useTreeStore();
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const windOffsetRef = useRef(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      const dt = timeRef.current ? (timestamp - timeRef.current) / 1000 : 0;
      timeRef.current = timestamp;

      if (settings.windEnabled) {
        windOffsetRef.current += dt * 0.5 * settings.animationSpeed;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [settings.windEnabled, settings.animationSpeed]);

  useEffect(() => {
    if (!isReplaying || !treeLayout) return;

    const replay = () => {
      setReplayProgress(replayProgress + 0.002 * settings.animationSpeed);
    };

    const interval = setInterval(replay, 16);
    return () => clearInterval(interval);
  }, [isReplaying, replayProgress, treeLayout, settings.animationSpeed, setReplayProgress]);

  const startReplay = useCallback(() => {
    setReplayProgress(0);
    setIsReplaying(true);
  }, [setReplayProgress, setIsReplaying]);

  const stopReplay = useCallback(() => {
    setIsReplaying(false);
  }, [setIsReplaying]);

  const getWindOffset = useCallback((x: number, y: number, phase: number, amplitude: number = 2) => {
    if (!settings.windEnabled) return 0;
    return Math.sin(windOffsetRef.current * 2 + x * 0.01 + y * 0.02 + phase) * amplitude;
  }, [settings.windEnabled]);

  return {
    windOffset: windOffsetRef.current,
    getWindOffset,
    startReplay,
    stopReplay,
    isReplaying,
    replayProgress,
  };
}
