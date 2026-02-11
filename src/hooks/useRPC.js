// src/hooks/useRPC.js
import { useEffect, useState } from 'react';
import useIPC from './useIPC';

export default function useRPC() {
  const ipc = useIPC();

  const [rpcs, setRpcs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await ipc.invoke('rpc:list');
      setRpcs(result || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const add = async (rpcConfig) => {
    await ipc.invoke('rpc:add', rpcConfig);
    await refresh();
  };

  const remove = async (id) => {
    await ipc.invoke('rpc:delete', { id });
    await refresh();
  };

  const update = async (id, updates) => {
    await ipc.invoke('rpc:update', { id, updates });
    await refresh();
  };

  const checkHealth = async (id) => {
    return ipc.invoke('rpc:checkHealth', { id });
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background health push events (optional worker)
  useEffect(() => {
    const off = ipc.on('rpc:healthUpdate', (event, payload) => {
      setRpcs((prev) =>
        prev.map((rpc) =>
          rpc.id === payload.id ? { ...rpc, ...payload } : rpc
        )
      );
    });

    return off;
  }, [ipc]);

  return {
    rpcs,
    loading,
    error,
    refresh,
    add,
    remove,
    update,
    checkHealth,
  };
}
