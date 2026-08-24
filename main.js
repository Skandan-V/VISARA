const { app, BrowserWindow, Tray, Menu, Notification, nativeImage, ipcMain, powerMonitor, screen, globalShortcut, shell } = require('electron');
const path = require('path');
const Store = require('./src/store');

// Explicit Windows AppUserModelID for taskbar icon binding
app.setAppUserModelId('Hyperdyn VISARA');

let store;
let mainWindow = null;
let exerciseWindow = null;
let islandWindow = null;
let tray = null;

// Timer State (Paused initially until user signs in or continues as guest)
let isRunning = false;
let isResting = false;
let secondsLeft = 20 * 60; // default 20 mins
let timerInterval = null;

function createTrayIconSVG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2334c759" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  return nativeImage.createFromBuffer(Buffer.from(svg));
}

function createWindow() {
  store = new Store();
  const settings = store.getAll();
  secondsLeft = calculateWorkSeconds(settings);

  const iconPath = path.join(__dirname, 'assets/icon.ico');

  // Main UI Window (Using visara app icon!)
  mainWindow = new BrowserWindow({
    width: 900,
    height: 640,
    minWidth: 900,
    minHeight: 520,
    resizable: true,
    frame: false,
    show: false,
    backgroundColor: '#ffffff',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src/renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // Defer secondary background windows for instant main window startup
  setImmediate(() => {
    initSecondaryWindows(iconPath);
  });

  createTray();
  startTimerEngine();
  setupGlobalShortcuts();
  setupPowerMonitor();
}

function initSecondaryWindows(iconPath) {
  if (!exerciseWindow) {
    exerciseWindow = new BrowserWindow({
      width: 800,
      height: 650,
      minWidth: 500,
      minHeight: 450,
      center: true,
      resizable: true,
      frame: false,
      alwaysOnTop: true,
      show: false,
      backgroundColor: '#ffffff',
      icon: iconPath,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    exerciseWindow.loadFile(path.join(__dirname, 'src/renderer/exercise.html'));

    exerciseWindow.on('close', (e) => {
      if (!app.isQuitting) {
        e.preventDefault();
        exerciseWindow.hide();
      }
    });
  }

  if (!islandWindow) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth } = primaryDisplay.workAreaSize;

    islandWindow = new BrowserWindow({
      width: 380,
      height: 52,
      x: Math.round((screenWidth - 380) / 2),
      y: 8,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      hasShadow: false,
      show: false,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    islandWindow.setAlwaysOnTop(true, 'screen-saver');
    islandWindow.loadFile(path.join(__dirname, 'src/renderer/island.html'));
    updateIslandVisibility(false);
  }
}

function updateIslandVisibility(enabled) {
  if (!islandWindow) return;
  if (enabled) {
    islandWindow.showInactive();
  } else {
    islandWindow.hide();
  }
}

function calculateWorkSeconds(s) {
  const duration = s.workDuration || 20;
  const unit = s.workUnit || 'MIN';
  return unit === 'MIN' ? duration * 60 : duration;
}

function calculateRestSeconds(s) {
  const duration = s.restDuration || 20;
  const unit = s.restUnit || 'SEC';
  return unit === 'MIN' ? duration * 60 : duration;
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/icon.png'));
  tray = new Tray(icon.isEmpty() ? createTrayIconSVG() : icon);
  tray.setToolTip('Visara Eye Care Assistant');

  updateTrayMenu();

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function updateTrayMenu() {
  if (!tray) return;

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const timeStr = `${m}:${s < 10 ? '0' + s : s}`;
  const statusStr = isResting ? `Resting (${timeStr})` : `Break in ${timeStr}`;

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Visara Eye Care', enabled: false },
    { label: statusStr, enabled: false },
    { type: 'separator' },
    {
      label: isRunning ? 'Pause Timer' : 'Resume Timer',
      click: () => toggleTimer()
    },
    {
      label: 'Add 5 Minutes Work',
      click: () => addWorkTime(5)
    },
    {
      label: 'Start Rest Break Now',
      click: () => triggerRestBreak()
    },
    { type: 'separator' },
    {
      label: '20-20-20 Rule Preset',
      click: () => applyPreset(20, 'MIN', 20, 'SEC')
    },
    {
      label: 'Deep Focus (50m/10m)',
      click: () => applyPreset(50, 'MIN', 10, 'MIN')
    },
    { type: 'separator' },
    {
      label: 'Show Dashboard',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip(`Visara - ${statusStr}`);
}

function startTimerEngine() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (!isRunning) return;

    secondsLeft--;

    if (secondsLeft <= 0) {
      if (!isResting) {
        triggerRestBreak();
      } else {
        finishRestBreak();
      }
    }

    sendTimerTick();
    updateTrayMenu();
  }, 1000);
}

function sendTimerTick() {
  const tickData = { secondsLeft, isRunning, isResting };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('timer-tick', tickData);
  }
  if (exerciseWindow && !exerciseWindow.isDestroyed()) {
    exerciseWindow.webContents.send('timer-tick', tickData);
  }
  if (islandWindow && !islandWindow.isDestroyed()) {
    islandWindow.webContents.send('timer-tick', tickData);
  }
}

function triggerRestBreak() {
  isResting = true;
  const settings = store.getAll();
  const restSecs = calculateRestSeconds(settings);
  secondsLeft = restSecs;

  const stats = store.incrementBreak();

  if (Notification.isSupported()) {
    new Notification({
      title: 'Time for Eye Rest!',
      body: 'Take a break and follow the guided eye exercises to relax your vision.',
      silent: !settings.notificationChime
    }).show();
  }

  if (exerciseWindow) {
    exerciseWindow.show();
    exerciseWindow.focus();
    exerciseWindow.webContents.send('exercise-start', {
      restDuration: restSecs,
      playChime: settings.notificationChime,
      soundTone: settings.soundTone || 'chime'
    });
  }

  if (mainWindow) {
    mainWindow.webContents.send('state-change', {
      settings: store.getAll(),
      stats: stats
    });
  }
}

function finishRestBreak() {
  isResting = false;
  const settings = store.getAll();
  secondsLeft = calculateWorkSeconds(settings);

  if (exerciseWindow) {
    exerciseWindow.hide();
  }

  if (!settings.autoStartNext) {
    isRunning = false;
  }

  if (Notification.isSupported()) {
    new Notification({
      title: 'Rest Completed!',
      body: 'Great job relaxing your eyes. Ready to focus again!',
      silent: false
    }).show();
  }

  sendTimerTick();
}

function toggleTimer() {
  isRunning = !isRunning;
  sendTimerTick();
  updateTrayMenu();
}

function addWorkTime(minutes) {
  const addSecs = (minutes || 5) * 60;
  secondsLeft += addSecs;
  if (!isRunning) isRunning = true;
  sendTimerTick();
  updateTrayMenu();
}

function applyPreset(workDur, workUnit, restDur, restUnit) {
  const newSettings = store.setAll({
    workDuration: workDur,
    workUnit: workUnit,
    restDuration: restDur,
    restUnit: restUnit
  });

  isResting = false;
  secondsLeft = calculateWorkSeconds(newSettings);
  sendTimerTick();

  if (mainWindow) {
    mainWindow.webContents.send('state-change', { settings: newSettings });
  }
}

function setupPowerMonitor() {
  powerMonitor.on('lock-screen', () => {
    isRunning = false;
    sendTimerTick();
  });

  powerMonitor.on('suspend', () => {
    isRunning = false;
    sendTimerTick();
  });

  powerMonitor.on('unlock-screen', () => {
    isRunning = true;
    sendTimerTick();
  });

  powerMonitor.on('resume', () => {
    isRunning = true;
    sendTimerTick();
  });
}

// IPC Registration
ipcMain.handle('get-settings', () => {
  return store.getAll();
});

ipcMain.handle('save-settings', (event, newSettings) => {
  const updated = store.setAll(newSettings);
  if (!isResting) {
    secondsLeft = calculateWorkSeconds(updated);
  }
  updateIslandVisibility(updated.dynamicIslandPip);
  sendTimerTick();

  // Broadcast state change to all open windows for real-time live updates
  const statePayload = { settings: updated, stats: store.get('stats') };
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('state-change', statePayload);
  if (exerciseWindow && !exerciseWindow.isDestroyed()) exerciseWindow.webContents.send('state-change', statePayload);
  if (islandWindow && !islandWindow.isDestroyed()) islandWindow.webContents.send('state-change', statePayload);

  return updated;
});

// Dynamic Transparent Mouse Click Pass-Through for Island Window
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) {
    win.setIgnoreMouseEvents(ignore, options);
  }
});

ipcMain.on('toggle-timer', () => {
  toggleTimer();
});

ipcMain.on('add-time', (event, minutes) => {
  addWorkTime(minutes);
});

ipcMain.on('dismiss-island', () => {
  store.set('dynamicIslandPip', false);
  updateIslandVisibility(false);
  if (mainWindow) {
    mainWindow.webContents.send('state-change', { settings: store.getAll() });
  }
});

ipcMain.on('reset-timer', () => {
  isResting = false;
  secondsLeft = calculateWorkSeconds(store.getAll());
  sendTimerTick();
});

ipcMain.on('start-rest-now', () => {
  triggerRestBreak();
});

ipcMain.on('set-session-active', (event, active) => {
  isRunning = !!active;
  const currentSettings = store.getAll();
  updateIslandVisibility(isRunning && currentSettings.dynamicIslandPip);
  sendTimerTick();
  updateTrayMenu();
});

ipcMain.on('complete-exercise', () => {
  finishRestBreak();
});

ipcMain.on('skip-exercise', () => {
  finishRestBreak();
});

ipcMain.on('snooze-exercise', (event, minutes) => {
  isResting = false;
  secondsLeft = minutes * 60;
  if (exerciseWindow) exerciseWindow.hide();
  sendTimerTick();
});

ipcMain.on('window-minimize', () => {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  if (win) win.minimize();
});

ipcMain.on('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  if (win === mainWindow) {
    win.hide();
  } else if (win) {
    win.close();
  }
});

// ==========================================================================
// Global Windows Hotkeys & Command Palette Engine
// ==========================================================================
function setupGlobalShortcuts() {
  if (!store) return;
  try {
    globalShortcut.unregisterAll();
    const settings = store.getAll();
    const hotkeys = settings.hotkeys || {
      enabled: true,
      commandPalette: 'CommandOrControl+Shift+Space',
      toggleTimer: 'CommandOrControl+Alt+T',
      startRest: 'CommandOrControl+Alt+R',
      addTime: 'CommandOrControl+Alt+A',
      resetTimer: 'CommandOrControl+Alt+X'
    };

    if (hotkeys.enabled === false) return;

    if (hotkeys.commandPalette) {
      globalShortcut.register(hotkeys.commandPalette, () => {
        if (mainWindow) {
          if (!mainWindow.isVisible()) mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('open-command-palette');
        }
      });
    }

    if (hotkeys.toggleTimer) {
      globalShortcut.register(hotkeys.toggleTimer, () => {
        toggleTimer();
      });
    }

    if (hotkeys.startRest) {
      globalShortcut.register(hotkeys.startRest, () => {
        triggerRestBreak();
      });
    }

    if (hotkeys.addTime) {
      globalShortcut.register(hotkeys.addTime, () => {
        addWorkTime(5);
      });
    }

    if (hotkeys.resetTimer) {
      globalShortcut.register(hotkeys.resetTimer, () => {
        isResting = false;
        secondsLeft = calculateWorkSeconds(store.getAll());
        sendTimerTick();
      });
    }
  } catch (err) {
    console.error('Failed to register global shortcuts:', err);
  }
}

ipcMain.handle('register-hotkeys', (event, hotkeys) => {
  const settings = store.getAll();
  settings.hotkeys = { ...settings.hotkeys, ...hotkeys };
  store.setAll({ hotkeys: settings.hotkeys });
  setupGlobalShortcuts();
  return settings.hotkeys;
});

ipcMain.on('open-command-palette', () => {
  if (mainWindow) {
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('open-command-palette');
  }
});

ipcMain.on('execute-command', (event, cmdId) => {
  if (cmdId === 'toggle-timer') toggleTimer();
  if (cmdId === 'start-rest') triggerRestBreak();
  if (cmdId === 'add-5m') addWorkTime(5);
  if (cmdId === 'reset-timer') {
    isResting = false;
    secondsLeft = calculateWorkSeconds(store.getAll());
    sendTimerTick();
  }
});

ipcMain.on('open-external', (event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep app running in system tray
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
