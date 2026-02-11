// src/hooks/useGasPrice.js
import { useEffect, useState } from 'react';

const DEFAULT_POLL_INTERVAL = 15_000; // 15s

export default function useGasPrice(chainId, { intervalMs } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timer;

    const pollInterval = intervalMs || DEFAULT_POLL_INTERVAL;

    const fetchGas = async () => {
      if (!window.electron || typeof window.electron.invoke !== 'function') {
        if (!isMounted) return;
        setError(new Error('Electron IPC not available'));
        setLoading(false);
        return;
      }

      try {
        if (!isMounted) return;
        setLoading(true);

        const result = await window.electron.invoke('gas:getPrices', {
          chainIds: [chainId],
        });

        const item = Array.isArray(result) ? result[0] : null;

        if (!isMounted) return;

        if (!item) {
          setError(new Error('No gas data returned'));
        } else if (item.error) {
          setError(new Error(item.error));
        } else {
          setData(item);
          setError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchGas();
    timer = setInterval(fetchGas, pollInterval);

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [chainId, intervalMs]);

  return {
    gas: data,
    loading,
    error,
  };
}
