const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");

const defaults = {
  appTheme: "system",
  launchOnStartup: false,
  notifications: true,
  autoStartTimer: false,
  breakTimeInterval: 20,
  isNativeThemeDark: nativeTheme.shouldUseDarkColors,
};

// Create class for storing user data
class Save {
  constructor(prefs) {
    const UserDataPath = app.getPath("userData");
    this.path = path.join(UserDataPath, prefs.configName + ".json");
    this.data = this.parseDataFile(this.path, prefs.defaults);
  }

  get(key) {
    return this.data[key];
  }

  set(key, val) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  parseDataFile(filePath, defaults) {
    try {
      return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
      return defaults;
    }
  }
}

const save = new Save({
  configName: "user-preferences",
  defaults: defaults,
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    minWidth: 500,
    minHeight: 480,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
    frame: false,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

const handleOpenSettings = (event) => {
  if (BrowserWindow.getAllWindows().length == 2) {
    return;
  }

  let theme = save.get("appTheme");
  let nativeDarkTheme = save.get("isNativeThemeDark");
  theme =
    theme == "system" && nativeDarkTheme
      ? "dark"
      : theme == "system" && !nativeDarkTheme
      ? "light"
      : theme;

  const parent = BrowserWindow.fromWebContents(event.sender);
  const settingsWindow = new BrowserWindow({
    width: 700,
    height: 500,
    minWidth: 500,
    minHeight: 400,
    autoHideMenuBar: true,
    parent: parent,
    modal: true,
    show: false,
    frame: false,
    backgroundColor: theme == "dark" ? "#212529" : "#fff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  settingsWindow.loadFile(path.join(__dirname, "settings.html"));

  settingsWindow.once("ready-to-show", () => {
    setTimeout(() => {
      settingsWindow.show();
    }, 50);
  });
};

const handleCloseSettings = (event, prefs) => {
  const settingsWindow = BrowserWindow.fromWebContents(event.sender);
  settingsWindow.hide();
  settingsWindow.close();

  for (const key in prefs) {
    if (Object.hasOwnProperty.call(prefs, key)) {
      save.set(key, prefs[key]);
    }
  }

  settingsWindow
    .getParentWindow()
    .webContents.send("update-preferences", prefs);
};

const handleFetchSettings = () => {
  try {
    return save.data;
  } catch (error) {
    return defaults;
  }
};

const handleFetchSetting = (event, pref) => {
  try {
    return save.get(pref);
  } catch (error) {
    return defaults[pref];
  }
};

const setAppTheme = (event, theme) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const parentWindow = window.getParentWindow();

  try {
    parentWindow.webContents.send("update-theme", theme);
  } catch (error) {}

  save.set("appTheme", theme);
};

const toggleMinimize = (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.minimize();
};

const toggleMaximize = (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.isMaximized() ? window.restore() : window.maximize();
};

const toggleClose = (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.close();
};

// Globally enable sandboxing for all renderers
app.enableSandbox();

//set auto launch on system startup
app.setLoginItemSettings({
  openAtLogin: save.get("launchOnStartup"),
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.on("open-settings", handleOpenSettings);
  ipcMain.on("close-settings", handleCloseSettings);
  ipcMain.on("set-app-theme", setAppTheme);
  ipcMain.on("toggle-minimize", toggleMinimize);
  ipcMain.on("toggle-maximize", toggleMaximize);
  ipcMain.on("toggle-close", toggleClose);

  ipcMain.handle("fetch-settings", handleFetchSettings);
  ipcMain.handle("fetch-setting", handleFetchSetting);

  save.set("isNativeThemeDark", nativeTheme.shouldUseDarkColors);

  createWindow();

  if (process.platform === "win32") {
    app.setAppUserModelId("twenty twenty");
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
