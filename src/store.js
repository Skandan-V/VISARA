const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class Store {
  constructor() {
    const userDataPath = app.getPath('userData');
    this.path = path.join(userDataPath, 'visara-settings.json');
    this.data = this.parseDataFile(this.path, this.defaults);
  }

  get defaults() {
    return {
      workDuration: 20,
      workUnit: 'MIN',
      restDuration: 20,
      restUnit: 'SEC',
      repeatCycle: 8,
      notificationChime: true,
      soundTone: 'chime',
      autoStartNext: false,
      dynamicIslandPip: true,
      islandAnimation: 'hamster',
      timerColor: '#38bdf8',
      islandBg: '#000000',
      recentTimerColors: ['#38bdf8', '#34c759', '#af52de', '#ff9500', '#ff2d55', '#00f2fe'],
      recentBgColors: ['#000000', '#1c1c1e', '#0b1329', '#061a12'],
      hotkeys: {
        commandPalette: 'CommandOrControl+Shift+Space',
        toggleTimer: 'CommandOrControl+Alt+T',
        startRest: 'CommandOrControl+Alt+R',
        addTime: 'CommandOrControl+Alt+A'
      },
      blocker: {
        enabled: true,
        apps: ['Discord.exe', 'Steam.exe', 'Spotify.exe', 'EpicGamesLauncher.exe'],
        websites: ['youtube.com', 'twitter.com', 'x.com', 'reddit.com', 'instagram.com', 'tiktok.com']
      },
      stats: {
        totalBreaks: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        weeklyBreaks: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
      }
    };
  }

  parseDataFile(filePath, defaults) {
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaults, null, 2));
        return defaults;
      }
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return { ...defaults, ...data };
    } catch (error) {
      return defaults;
    }
  }

  get(key) {
    return this.data[key];
  }

  set(key, val) {
    this.data[key] = val;
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
    } catch (e) {}
    return this.data;
  }

  setAll(newSettings) {
    this.data = { ...this.data, ...newSettings };
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
    } catch (e) {}
    return this.data;
  }

  getAll() {
    return this.data;
  }

  incrementBreak() {
    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayName = dayNames[todayDate.getDay()];

    if (!this.data.stats) {
      this.data.stats = {
        totalBreaks: 0,
        lastResetDate: todayStr,
        weeklyBreaks: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
      };
    }

    if (!this.data.stats.weeklyBreaks) {
      this.data.stats.weeklyBreaks = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    }

    if (this.data.stats.lastResetDate !== todayStr) {
      this.data.stats.totalBreaks = 0;
      this.data.stats.lastResetDate = todayStr;
      
      if (currentDayName === 'Mon') {
        this.data.stats.weeklyBreaks = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      }
    }

    this.data.stats.totalBreaks += 1;
    this.data.stats.weeklyBreaks[currentDayName] = (this.data.stats.weeklyBreaks[currentDayName] || 0) + 1;

    this.set('stats', this.data.stats);
    return this.data.stats;
  }
}

module.exports = Store;
