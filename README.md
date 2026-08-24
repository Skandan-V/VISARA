<div align="center">
  <img src="assets/icon.png" alt="Visara Logo" width="96" height="96" />
  <h1>Visara</h1>
  <p><strong>Desktop Eye Rest Timer and Guided Ocular Wellness Assistant</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/Skandan-V/VISARA)
  [![Electron](https://img.shields.io/badge/Electron-31.0.0-47848F.svg?logo=electron)](https://www.electronjs.org/)
  [![GitHub Releases](https://img.shields.io/github/v/release/Skandan-V/VISARA?color=34C759)](https://github.com/Skandan-V/VISARA/releases)
</div>

---

## Overview

**Visara** is an open-source desktop application designed to prevent digital eye strain and computer vision syndrome (CVS). Built around the clinically validated **20-20-20 rule**, Visara provides non-intrusive timers, procedural Web Audio acoustic chimes, interactive 4-step guided ocular exercises, and an OLED-styled floating Dynamic Island Picture-in-Picture (PIP) widget.

---

## Features

- **Automated 20-20-20 Intervals**: Configurable work and rest cycles with visual countdown progress and background micro-rest scheduling.
- **Procedural Acoustic Synthesis**: Real-time synthesized chimes (Gentle Chime, Tibetan Bowl, Marimba, Zen Bell, Water Drop) powered by the native Web Audio API with zero external audio assets.
- **Dynamic Island HUD**: Minimalist always-on-top transparent widget with live status indicators, timer controls, and 14+ customizable animated loaders.
- **Guided Ocular Exercises**: Interactive animated routines covering Circular Eye Rolling, Horizontal and Vertical Saccadic Tracking, and Lubricating Blink intervals.
- **100% Offline and Private**: All settings, timers, and activity streaks are processed and stored strictly locally on your machine with zero telemetry.
- **Global Hotkeys and System Tray**: Manage rest cycles and timer modes seamlessly in the background.

---

## Download and Installation

### Pre-Built Binaries

Pre-compiled binaries for Windows, macOS, and Linux are available on the [Releases](https://github.com/Skandan-V/VISARA/releases) page.

| Operating System | Package Format | Description |
| :--- | :--- | :--- |
| **Windows** | `.exe` (NSIS) | Complete installer with custom path configuration and desktop shortcuts |
| **Windows** | `.exe` (Portable) | Standalone executable requiring no installation |
| **macOS** | `.dmg` / `.zip` | Universal disk image for Apple Silicon and Intel Macs |
| **Linux** | `.AppImage` / `.deb` | Portable AppImage and Debian package |

---

## Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
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

### 3. Run Locally

```bash
npm start
```

### 4. Build Distribution Packages

```bash
# Build for current OS
npm run dist

# Specific OS targets
npm run dist:win
npm run dist:mac
npm run dist:linux
```

Compiled binaries will be generated in the `release/` directory.

---

## Project Structure

```text
VISARA/
├── .github/workflows/       # GitHub Actions CI/CD and Pages deployment
├── assets/                  # Application icons and branding assets
├── src/
│   ├── renderer/            # User interface and dashboard windows
│   │   ├── animations/      # CSS loaders and HUD animation styles
│   │   ├── index.html       # Main application window
│   │   ├── customization.html # Dynamic Island customization view
│   │   ├── exercise.html    # Guided ocular exercise view
│   │   └── island.html      # Floating Dynamic Island widget
│   ├── audio.js             # Procedural Web Audio synthesizer
│   ├── store.js             # Local preferences and streak storage
│   └── services/            # Client authentication and services
├── index.html               # Project marketing website (GitHub Pages)
├── installer.nsh            # Custom NSIS Windows installer script
├── main.js                  # Electron main process and lifecycle manager
├── preload.js               # Secure IPC context bridge
├── package.json             # Build configuration and scripts
├── LICENSE                  # MIT License
└── README.md                # Project documentation
```

---

## Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository
2. Create your branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'feat: add NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 **Skandan V** ([@Skandan-V](https://github.com/Skandan-V))
