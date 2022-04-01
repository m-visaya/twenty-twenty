const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

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
  defaults: {
    nightmode: false,
    launchOnStartup: false,
    notifications: true,
    autoStartTimer: false,
    breakTimeInterval: 60,
  },
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
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

const handleOpenSettings = (event) => {
  const parent = BrowserWindow.fromWebContents(event.sender);
  const settingsWindow = new BrowserWindow({
    width: 700,
    height: 500,
    autoHideMenuBar: true,
    parent: parent,
    modal: true,
    show: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  settingsWindow.loadFile(path.join(__dirname, "settings.html"));
  settingsWindow.show();
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
};

const handleFetchSettings = () => {
  try {
    return save.data;
  } catch (error) {
    return;
  }
};

// Globally enable sandboxing for all renderers
app.enableSandbox();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.on("open-settings", handleOpenSettings);
  ipcMain.on("close-settings", handleCloseSettings);
  ipcMain.handle("fetch-settings", handleFetchSettings);

  createWindow();
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
