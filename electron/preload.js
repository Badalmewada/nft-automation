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

  walletGroups: {
  create: (data) =>
    ipcRenderer.invoke("walletGroup:create", data),

  list: () =>
    ipcRenderer.invoke("walletGroup:list"),

  delete: (id) =>
    ipcRenderer.invoke("walletGroup:delete", id),
},

};

// Expose to renderer
contextBridge.exposeInMainWorld("api", ipcApi);

contextBridge.exposeInMainWorld("electron", {
  invoke: ipcApi.invoke,
  on: ipcApi.on,
  removeListener: ipcApi.removeListener,
  ipc: ipcApi,
});

