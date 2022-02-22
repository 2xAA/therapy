"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItem,
  dialog,
} from "electron";
import fs from "fs";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
import g from "glob";
import { promisify } from "util";
import * as mm from "music-metadata";

const isDevelopment = process.env.NODE_ENV !== "production";

const glob = promisify(g);

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
  {
    scheme: "therapy",
    privileges: { secure: true, standard: true, supportFetchAPI: true },
  },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.on("dropped-file", async (event, [directory]) => {
    const files = await glob(`${directory}/**/*.@(mp3|mp4|m4a|wav|ogg)`);

    let parsedFiles = [];

    for (let [index, filePath] of files.entries()) {
      try {
        const metadata = await mm.parseFile(filePath);
        parsedFiles.push({ filePath, fromDirectory: directory, metadata });
        if (parsedFiles.length === 100 || index === files.length - 1) {
          win.webContents.send("dropped-file", parsedFiles);
          parsedFiles = [];
        }
      } catch (error) {
        console.error(error.message);
      }
    }
  });

  ipcMain.on("save-file", async (event, { fileName: defaultPath, content }) => {
    const result = await dialog.showSaveDialog(win, {
      filters: [{ name: "M3U Playlist", extensions: ["m3u"] }],
      defaultPath,
    });

    if (result.canceled) {
      return;
    }

    try {
      await fs.promises.writeFile(result.filePath, content);
    } catch (e) {
      dialog.showMessageBox(win, {
        type: "error",
        message: "Could not save preset to file",
        detail: e.toString(),
      });
    }
  });

  ipcMain.on("context-menu", (event, { type, payload, x, y }) => {
    const menu = new Menu();

    if (type === "track") {
      [
        new MenuItem({
          label: "Play",
          click: () => win.webContents.send("play-track", payload.filePath),
        }),

        new MenuItem({ type: "separator" }),

        new MenuItem({
          label: "Remove from library",
          click: () => win.webContents.send("remove-track", payload.filePath),
        }),
      ].forEach((item) => menu.append(item));
    }

    if (type === "crate") {
      [
        new MenuItem({
          label: "Export playlist",
          click: () =>
            win.webContents.send("export-crate", {
              crateId: payload.crateId,
              type: "playlist",
            }),
        }),
        new MenuItem({
          label: "Export ZIP",
          click: () =>
            // win.webContents.send("export-crate", {
            //   crateId: payload.crateId,
            //   type: "zip",
            // }),
            dialog.showMessageBox(win, {
              type: "error",
              message: "Not implemented yet :(",
              detail: "",
            }),
        }),
      ].forEach((item) => menu.append(item));
    }

    menu.popup({ x, y });
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }

  protocol.registerFileProtocol("therapy", (request, callback) => {
    const url = request.url.replace("therapy://", "");

    try {
      return callback(decodeURI(url));
    } catch (error) {
      console.error(error);
      return callback(404);
    }
  });

  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
