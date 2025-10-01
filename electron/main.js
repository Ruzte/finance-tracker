// electron/main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development" || process.env.ELECTRON_DEV === "true";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // preload if you have one
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  try {
    if (isDev) {
      // Development: load Vite server
      const devUrl = "http://localhost:5173";
      console.log("Loading Dev URL:", devUrl);
      win.loadURL(devUrl);
      win.webContents.openDevTools();
    } else {
      // Production: load built index.html (relative path inside app bundle / asar)
      const indexPath = path.join(__dirname, "../dist/index.html");
      console.log("Loading production index.html from:", indexPath);
      win.loadFile(indexPath);
    }
  } catch (err) {
    console.error("Failed to load page:", err);
  }

  // Optional: listen for renderer errors
  win.webContents.on("crashed", () => {
    console.error("Renderer process crashed.");
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Helpful for packaged apps to log uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception in main process:", err);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
