const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  closeSettings: (prefs) => ipcRenderer.send("close-settings", prefs),
  openSettings: () => ipcRenderer.send("open-settings"),
  fetchSettings: () => ipcRenderer.invoke("fetch-settings"),
});
