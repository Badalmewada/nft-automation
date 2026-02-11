// src/hooks/useMintJob.js
import { useState, useCallback } from 'react';

export default function useMintJob() {
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const runMintJob = useCallback(async (jobPayload) => {
    setRunning(true);
    setError(null);

    try {
      if (!window.electron || typeof window.electron.invoke !== 'function') {
        throw new Error('Electron IPC not available – check preload.js');
      }

      const result = await window.electron.invoke('tasks:runMintJob', jobPayload);
      setLastResult(result);
      return result;
    } catch (err) {
      console.error('runMintJob error:', err);
      setError(err?.message || String(err));
      throw err;
    } finally {
      setRunning(false);
    }
  }, []);

  return {
    running,
    lastResult,
    error,
    runMintJob,
  };
}
