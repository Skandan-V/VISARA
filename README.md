<div align="center">
  <img src="assets/icon.png" alt="Visara Logo" width="100" height="100" />
  <h1>VISARA</h1>
  <p><strong>Desktop Eye Move Timer & Guided Ocular Wellness Assistant</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078D6.svg?logo=windows)](https://github.com/Skandan-V/VISARA)
  [![Electron](https://img.shields.io/badge/Electron-31.0.0-47848F.svg?logo=electron)](https://www.electronjs.org/)
  [![GitHub Repository](https://img.shields.io/badge/GitHub-Skandan--V%2FVISARA-181717.svg?logo=github)](https://github.com/Skandan-V/VISARA)
</div>

---

## 🌟 Overview

**Visara** is an open-source desktop application designed to prevent digital eye strain, computer vision syndrome (CVS), and fatigue. Built around the clinical **20-20-20 rule**, Visara provides smooth timers, procedural Web Audio harmonic chimes, interactive 4-step guided ocular exercises, and a floating Dynamic Island Picture-in-Picture (PIP) widget.

---

## ✨ Features

- ⏱️ **Intelligent 20-20-20 Timer**: Customizable work & rest cycles with visual progress indicators and subtle cycle tracking.
- 👁️ **Guided 4-Step Eye Exercises**: Interactive animated exercise routines (Far Gaze Focus, Circular Eye Rolling, Horizontal & Vertical Scanning, and Gentle Blinking).
- 🎵 **Procedural Web Audio Chimes**: 7 built-in synthesizer sound profiles (Gentle Chime, Tibetan Bowl, Marimba Arpeggio, Zen Bell, Water Drop, Soft Harp, and Digital Pip) synthesized directly in real-time with zero external audio assets.
- 🏝️ **Dynamic Island PIP Mode**: Minimalist transparent floating overlay that stays on top without obstructing your workflow.
- 📊 **Weekly Activity Tracking**: Real-time weekly eye rest statistics and streak analytics saved locally.
- 🔒 **100% Privacy & Offline-First**: All settings, stats, and audio are processed locally on your machine.
- ⌨️ **Global Hotkeys & System Tray**: Control your timers and rest breaks seamlessly from anywhere in Windows.

---

## 📦 Download & Installation

### Windows Installer (Recommended)
Download the latest signed release from the [Releases](https://github.com/Skandan-V/VISARA/releases) page:
- **`Visara Setup 1.0.0.exe`**: Complete Windows installer with desktop and start menu shortcuts.
- **`Visara 1.0.0.exe`**: Portable standalone executable that runs without installation.

---

## 🛠️ Development & Building from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Skandan-V/VISARA.git
cd VISARA
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development Mode
```bash
npm start
```

### 4. Build Signed Windows Executable & Installer
```bash
npm run dist
```
Compiled binaries will be generated inside the `release/` directory.

---

## 📂 Project Structure

```text
VISARA/
├── assets/                  # High-resolution logos, icons, and Windows .ico assets
├── src/
│   ├── renderer/            # Electron renderer UI components
│   │   ├── index.html       # Main dashboard window
│   │   ├── style.css        # Minimalist dashboard styles
│   │   ├── app.js           # Dashboard controller & state manager
│   │   ├── exercise.html    # Guided eye exercise window
│   │   ├── exercise.css     # Exercise animations & styling
│   │   ├── exercise.js      # Step-by-step ocular exercise engine
│   │   ├── island.html      # Dynamic Island PIP widget
│   │   └── island.js        # PIP window controller
│   ├── audio.js             # Web Audio procedural harmonic synthesizer
│   ├── store.js             # Local JSON settings & stats store
│   └── services/            # Firebase auth & telemetry services
├── main.js                  # Electron main process & window lifecycle
├── preload.js               # Secure IPC context bridge
├── installer.nsh            # Custom NSIS installer script
├── package.json             # Project configuration & build scripts
├── LICENSE                  # MIT Open Source License
└── README.md                # Project documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check out the [Issues page](https://github.com/Skandan-V/VISARA/issues) or submit a feature idea via our in-app suggestion link.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

Copyright (c) 2026 **Skandan V** ([@Skandan-V](https://github.com/Skandan-V))
