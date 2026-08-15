import { useState, useEffect, useCallback } from 'react';

interface UseOrderProcessingTimerOptions {
  durationSeconds?: number;
  onComplete?: () => void;
}

export function useOrderProcessingTimer({
  durationSeconds = 5,
  onComplete,
}: UseOrderProcessingTimerOptions = {}) {
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationSeconds);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const startTimer = useCallback(() => {
    setIsProcessing(true);
    setSecondsRemaining(durationSeconds);
    setProgressPercent(0);
  }, [durationSeconds]);

  const skipTimer = useCallback(() => {
    setIsProcessing(false);
    setSecondsRemaining(0);
    setProgressPercent(100);
    if (onComplete) onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!isProcessing) return;

    const intervalMs = 50; // High frequency update for smooth progress bar
    const totalMs = durationSeconds * 1000;
    let elapsedMs = 0;

    const interval = setInterval(() => {
      elapsedMs += intervalMs;
      const percent = Math.min(100, (elapsedMs / totalMs) * 100);
      const rem = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));

      setProgressPercent(percent);
      setSecondsRemaining(rem);

      if (elapsedMs >= totalMs) {
        clearInterval(interval);
        setIsProcessing(false);
        if (onComplete) onComplete();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isProcessing, durationSeconds, onComplete]);

  return {
    isProcessing,
    secondsRemaining,
    progressPercent,
    skipTimer,
    replayTimer: startTimer,
  };
}
