// src/hooks/useIPC.js
import { useEffect, useRef } from 'react';

export default function useIPC() {
  const listenersRef = useRef({}); // { channel: [callbacks...] }

  const invoke = async (channel, payload) => {
    if (!window?.electron?.ipc?.invoke) {
      console.warn('IPC invoke unavailable:', channel, payload);
      return null;
    }
    return window.electron.ipc.invoke(channel, payload);
  };

  const on = (channel, callback) => {
    if (!window?.electron?.ipc?.on) {
      console.warn('IPC on unavailable:', channel);
      return () => {};
    }

    window.electron.ipc.on(channel, callback);

    // Track listeners to remove on unmount
    listenersRef.current[channel] = listenersRef.current[channel] || [];
    listenersRef.current[channel].push(callback);

    return () => {
      window.electron.ipc.removeListener?.(channel, callback);
      listenersRef.current[channel] =
        (listenersRef.current[channel] || []).filter((cb) => cb !== callback);
    };
  };

  // Cleanup all listeners on unmount
  useEffect(() => {
    return () => {
      Object.entries(listenersRef.current).forEach(([channel, callbacks]) => {
        callbacks.forEach((cb) =>
          window.electron.ipc.removeListener?.(channel, cb)
        );
      });
    };
  }, []);

  return {
    invoke,
    on,
  };
}
