// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Common safe IPC API
const ipcApi = {
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),

  on: (channel, listener) => {
    // listener ko sirf payload pass karein, event nahi
    const wrapped = (_event, data) => listener(data);
    ipcRenderer.on(channel, wrapped);

    // unsubscribe function
    return () => {
      ipcRenderer.removeListener(channel, wrapped);
    };
  },

  removeListener: (channel, listener) => {
    ipcRenderer.removeListener(channel, listener);
  },
};

// Expose to renderer
contextBridge.exposeInMainWorld('electron', {
  // 🔹 legacy style – jaisa tumhara frontend expect kar raha hai:
  invoke: ipcApi.invoke,
  on: ipcApi.on,
  removeListener: ipcApi.removeListener,

  // 🔹 nice namespaced style (agar kahin useIPC hook `window.electron.ipc` expect kare):
  ipc: ipcApi,
});
