const electron = require("electron");
const { app, ipcMain, BrowserWindow, globalShortcut } = electron;

let mainWindow;
let warning = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.setMenu(null);
  mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on("overThreshold", (event, arg) => {
    if (!warning) {
      const size = electron.screen.getPrimaryDisplay().workAreaSize;
      warning = new BrowserWindow({
        parent: mainWindow,
        left: 0,
        top: 0,
        width: size.width,
        height: size.height,
        frame: false,
        show: true,
        transparent: true,
        resizable: false,
        alwaysOnTop: true
      });
      warning.setIgnoreMouseEvents(true);
      warning.maximize();
      warning.loadFile("warning.html");
      warning.on("closed", () => {
        warning = null;
      });
    }
  });

  globalShortcut.register("Escape", () => {
    if (warning) warning.close();
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
