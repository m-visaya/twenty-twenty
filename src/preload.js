const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  closeSettings: () => ipcRenderer.send("close-settings"),
  openSettings: () => ipcRenderer.send("open-settings"),
});
