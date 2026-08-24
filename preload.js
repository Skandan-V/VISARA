const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('visaraAPI', {
  // Timer State Methods
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  toggleTimer: () => ipcRenderer.send('toggle-timer'),
  addTime: (minutes) => ipcRenderer.send('add-time', minutes),
  dismissIsland: () => ipcRenderer.send('dismiss-island'),
  resetTimer: () => ipcRenderer.send('reset-timer'),
  startRestNow: () => ipcRenderer.send('start-rest-now'),
  setSessionActive: (active) => ipcRenderer.send('set-session-active', active),
  
  // Hotkeys & Command Palette Methods
  registerHotkeys: (hotkeys) => ipcRenderer.invoke('register-hotkeys', hotkeys),
  openCommandPalette: () => ipcRenderer.send('open-command-palette'),
  executeCommand: (cmdId) => ipcRenderer.send('execute-command', cmdId),

  // Distraction Blocker Methods
  getBlockerSettings: () => ipcRenderer.invoke('get-blocker-settings'),
  saveBlockerSettings: (data) => ipcRenderer.invoke('save-blocker-settings', data),

  // Exercise Methods
  completeExercise: () => ipcRenderer.send('complete-exercise'),
  skipExercise: () => ipcRenderer.send('skip-exercise'),
  snoozeExercise: (minutes) => ipcRenderer.send('snooze-exercise', minutes),

  // Window Management
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  openExternal: (url) => ipcRenderer.send('open-external', url),

  // Transparent Native Mouse Event Pass-Through for PIP Island Window
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),

  // Event Listeners
  onTimerTick: (callback) => {
    ipcRenderer.on('timer-tick', (event, data) => callback(data));
  },
  onStateChange: (callback) => {
    ipcRenderer.on('state-change', (event, data) => callback(data));
  },
  onExerciseStart: (callback) => {
    ipcRenderer.on('exercise-start', (event, data) => callback(data));
  },
  onOpenCommandPalette: (callback) => {
    ipcRenderer.on('open-command-palette', (event, data) => callback(data));
  },
  onBlockerAlert: (callback) => {
    ipcRenderer.on('blocker-alert', (event, data) => callback(data));
  }
});
