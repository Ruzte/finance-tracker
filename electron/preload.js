// electron/preload.js
const { contextBridge } = require("electron");

// Expose a tiny safe API to renderer (expand as needed)
contextBridge.exposeInMainWorld("electronAPI", {
  appName: () => "Finance Tracker",
});
