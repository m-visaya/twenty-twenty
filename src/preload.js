const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  closeSettings: (prefs) => ipcRenderer.send("close-settings", prefs),
  openSettings: () => ipcRenderer.send("open-settings"),
  fetchSettings: () => ipcRenderer.invoke("fetch-settings"),
  fetchSetting: (pref) => ipcRenderer.invoke("fetch-setting", pref),
  setAppTheme: (theme) => ipcRenderer.send("set-app-theme", theme),
  toggleMinimize: () => ipcRenderer.send("toggle-minimize"),
  toggleMaximize: () => ipcRenderer.send("toggle-maximize"),
  toggleClose: () => ipcRenderer.send("toggle-close"),
  setWindowFocus: () => ipcRenderer.send("set-window-focus"),
  onUpdateTheme: (callback) => ipcRenderer.on("update-theme", callback),
  onUpdatePreferences: (callback) =>
    ipcRenderer.on("update-preferences", callback),
});
