// electron/main.js
require('dotenv').config();
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const logger = require('./utils/logger');
const getDb = require('./db/database');
const { registerIpcHandlers } = require('./ipc/handlers');

// Keep a global reference to prevent GC
let mainWindow;

/**
 * Create the main BrowserWindow.
 */
function createWindow() {
  const isDev = process.env.NODE_ENV === 'development';

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    title: 'NFT Mint Pro',
    backgroundColor: '#020617', // slate-950
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
    },
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    (isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../dist/index.html')}`);

  logger.info('Loading renderer', { url: startUrl });
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Initialize app: DB, IPC, etc.
 */
async function initialize() {
  try {
    logger.info('App initializing...');
    // Initialize DB (lazy but we can warm it here)
    getDb();

    // Register IPC handlers
    registerIpcHandlers();

    // TODO: initialize encryption master password flow here
    // e.g. prompt user on first run or unlock screen

    createWindow();
  } catch (err) {
    logger.error('Initialization failed', { error: String(err) });
    app.quit();
  }
}

/* ----------------------------- App lifecycle ----------------------------- */

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(initialize);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
