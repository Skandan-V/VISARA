// Main Dashboard Controller (Light Mode design.html system & Real Weekly Eye Activity Data Collection)
import { authManager } from '../services/auth.js';
import { trackVisaraEvent } from '../services/firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainTimer = document.getElementById('mainTimer');
    const timerLabel = document.getElementById('timerLabel');
    const btnTogglePlay = document.getElementById('btnTogglePlay');
    const playBtnText = document.getElementById('playBtnText');
    const playIcon = document.getElementById('playIcon');
    const btnStartRest = document.getElementById('btnStartRest');

    // Full-Screen Auth & Dashboard Containers
    const mainDashboardScreen = document.getElementById('mainDashboardScreen');

    // Auth & Account Elements
    const userAuthPill = document.getElementById('userAuthPill');
    const userAvatarMini = document.getElementById('userAvatarMini');
    const userNameMini = document.getElementById('userNameMini');
    const userAccountDrawer = document.getElementById('userAccountDrawer');
    const drawerAvatar = document.getElementById('drawerAvatar');
    const drawerName = document.getElementById('drawerName');
    const drawerEmail = document.getElementById('drawerEmail');
    const drawerStatusBadge = document.getElementById('drawerStatusBadge');
    const btnSignOut = document.getElementById('btnSignOut');

    // Controls
    const workSlider = document.getElementById('workSlider');
    const sliderFill = document.getElementById('sliderFill');
    const sliderThumb = document.getElementById('sliderThumb');
    const workValueText = document.getElementById('workValueText');

    const restInput = document.getElementById('restInput');
    const restUnitBtn = document.getElementById('restUnitBtn');
    const restUnitText = document.getElementById('restUnitText');

    const repeatCycleInput = document.getElementById('repeatCycleInput');
    const repeatStatusCircle = document.getElementById('repeatStatusCircle');

    const statTotalBreaks = document.getElementById('statTotalBreaks');
    const statEyeStrain = document.getElementById('statEyeStrain');

    const soundSelect = document.getElementById('soundSelect');
    const btnPreviewSound = document.getElementById('btnPreviewSound');
    const chimeToggle = document.getElementById('chimeToggle');
    const autoStartToggle = document.getElementById('autoStartToggle');
    const pipToggle = document.getElementById('pipToggle');

    const btnOpenCustomization = document.getElementById('btnOpenCustomization');
    const btnOpenPalette = document.getElementById('btnOpenPalette');

    const btnAddPreset = document.getElementById('btnAddPreset');
    const popover = document.getElementById('popover');
    const btnDismissPreset = document.getElementById('btnDismissPreset');
    const preset20 = document.getElementById('preset20');
    const preset50 = document.getElementById('preset50');
    const preset5 = document.getElementById('preset5');

    // Weekly Eye Activity Chart Elements
    const chartMetricBreaks = document.getElementById('chartMetricBreaks');
    const chartTargetText = document.getElementById('chartTargetText');
    const chartAvgBadge = document.getElementById('chartAvgBadge');
    const chartDashedLine = document.getElementById('chartDashedLine');

    // Window Actions
    const btnMinimize = document.getElementById('btnMinimize');
    const btnMaximize = document.getElementById('btnMaximize');
    const btnClose = document.getElementById('btnClose');

    let currentSettings = {
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
        islandBg: '#000000'
    };

    let isRunning = true;
    let isResting = false;

    // Load Initial State
    if (window.visaraAPI) {
        window.visaraAPI.getSettings().then((s) => {
            currentSettings = { ...currentSettings, ...s };
            updateUIFromSettings();
            if (s && s.stats) {
                updateStatsUI(s.stats);
            }
        });

        window.visaraAPI.onTimerTick((data) => {
            isRunning = data.isRunning;
            isResting = data.isResting;
            updateTimerDisplay(data.secondsLeft);
            updatePlayButtonUI();
        });

        window.visaraAPI.onStateChange((data) => {
            if (data.settings) {
                currentSettings = { ...currentSettings, ...data.settings };
                updateUIFromSettings();
            }
            if (data.stats) {
                updateStatsUI(data.stats);
            }
        });
    }

    function updateUIFromSettings() {
        workSlider.value = currentSettings.workDuration || 20;
        workValueText.innerText = `${workSlider.value}m`;
        updateSliderFill(workSlider.value, 1, 60);

        restInput.value = currentSettings.restDuration || 20;
        restUnitText.innerText = currentSettings.restUnit || 'SEC';

        if (repeatCycleInput) {
            repeatCycleInput.value = currentSettings.repeatCycle || 8;
        }

        if (soundSelect) {
            soundSelect.value = currentSettings.soundTone || 'chime';
        }

        if (chimeToggle) chimeToggle.classList.toggle('active', !!currentSettings.notificationChime);
        if (autoStartToggle) autoStartToggle.classList.toggle('active', !!currentSettings.autoStartNext);
        if (pipToggle) pipToggle.classList.toggle('active', !!currentSettings.dynamicIslandPip);
    }

    function updateStatsUI(stats) {
        if (!stats) return;

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todayDate = new Date();
        const currentDayName = dayNames[todayDate.getDay()];

        const weekly = stats.weeklyBreaks || { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const todayCount = stats.totalBreaks || weekly[currentDayName] || 0;
        const target = currentSettings.repeatCycle || 8;

        // Metric Header & Daily Stats
        if (chartMetricBreaks) chartMetricBreaks.innerText = `${todayCount} Breaks`;
        if (statTotalBreaks) statTotalBreaks.innerText = todayCount;

        if (statEyeStrain) {
            if (todayCount >= target) {
                statEyeStrain.innerText = 'Optimal Focus';
                statEyeStrain.style.color = 'var(--accent-green)';
            } else if (todayCount >= target / 2) {
                statEyeStrain.innerText = 'Low Risk';
                statEyeStrain.style.color = 'var(--text-secondary)';
            } else {
                statEyeStrain.innerText = 'Elevated Risk';
                statEyeStrain.style.color = 'var(--text-error)';
            }
        }

        // Target Pill Badge
        if (chartTargetText) {
            const pct = Math.min(100, Math.round((todayCount / target) * 100));
            chartTargetText.innerText = `↗ ${pct}% target`;
        }

        const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        let sumBreaks = 0;
        let maxBreaks = Math.max(target, 1);

        daysOrder.forEach((day) => {
            const count = weekly[day] || 0;
            sumBreaks += count;
            if (count > maxBreaks) maxBreaks = count;
        });

        // Dynamic Average
        const avg = (sumBreaks / 7).toFixed(1);
        if (chartAvgBadge) chartAvgBadge.innerText = `Avg ${avg}`;

        // Render each bar column accurately with real data
        daysOrder.forEach((day) => {
            const bar = document.getElementById(`bar-${day}`);
            const lbl = document.getElementById(`lbl-${day}`);
            const col = document.getElementById(`col-${day}`);

            if (bar && lbl && col) {
                const count = weekly[day] || 0;
                const hPct = count > 0 ? Math.min(88, Math.max(14, Math.round((count / maxBreaks) * 88))) : 6;
                bar.style.height = `${hPct}px`;

                // Clean existing active tooltip callout
                const existingTooltip = col.querySelector('.chart-tooltip-badge');
                if (existingTooltip) existingTooltip.remove();

                if (day === currentDayName) {
                    bar.classList.add('active');
                    lbl.classList.add('active');

                    const tooltip = document.createElement('div');
                    tooltip.className = 'chart-tooltip-badge';
                    tooltip.innerText = `${count} Breaks`;
                    col.prepend(tooltip);
                } else {
                    bar.classList.remove('active');
                    lbl.classList.remove('active');
                }
            }
        });
    }

    function updateTimerDisplay(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        mainTimer.innerText = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
        
        if (isResting) {
            timerLabel.innerText = 'Eye Rest in Progress';
            mainTimer.style.color = 'var(--accent-green)';
        } else {
            timerLabel.innerText = 'Until next eye movement';
            mainTimer.style.color = 'var(--text-primary)';
        }
    }

    function updatePlayButtonUI() {
        if (isRunning) {
            playBtnText.innerText = 'Pause';
            playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect>';
        } else {
            playBtnText.innerText = 'Resume';
            playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
        }
    }

    function updateSliderFill(val, min, max) {
        const pct = ((val - min) / (max - min)) * 100;
        if (sliderFill) sliderFill.style.width = `${pct}%`;
        if (sliderThumb) sliderThumb.style.left = `${pct}%`;
        if (workSlider) workSlider.style.setProperty('--slider-progress', `${pct}%`);
    }

    function saveCurrentSettings() {
        if (window.visaraAPI) {
            window.visaraAPI.saveSettings(currentSettings);
        }
    }

    // Work Slider Interaction
    if (workSlider) {
        workSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (workValueText) workValueText.innerText = `${val}m`;
            updateSliderFill(val, 1, 60);
        });

        workSlider.addEventListener('change', (e) => {
            currentSettings.workDuration = parseInt(e.target.value, 10);
            saveCurrentSettings();
        });
    }

    // Rest Input Interaction
    if (restInput) {
        restInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value, 10);
            if (isNaN(val) || val < 1) val = 20;
            currentSettings.restDuration = val;
            saveCurrentSettings();
        });
    }

    // Rest Unit Toggle
    if (restUnitBtn) {
        restUnitBtn.addEventListener('click', () => {
            currentSettings.restUnit = currentSettings.restUnit === 'MIN' ? 'SEC' : 'MIN';
            if (restUnitText) restUnitText.innerText = currentSettings.restUnit;
            saveCurrentSettings();
        });
    }

    // Repeat Cycle Input Customization Interaction
    if (repeatCycleInput) {
        repeatCycleInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value, 10);
            if (isNaN(val) || val < 1) val = 8;
            currentSettings.repeatCycle = val;
            saveCurrentSettings();
            if (window.visaraAPI) {
                window.visaraAPI.getSettings().then(s => {
                    if (s && s.stats) updateStatsUI(s.stats);
                });
            }
        });
    }

    if (repeatStatusCircle) {
        repeatStatusCircle.style.cursor = 'pointer';
        repeatStatusCircle.addEventListener('click', () => {
            const cycles = [4, 6, 8, 10, 12, 16];
            const current = currentSettings.repeatCycle || 8;
            const nextIdx = (cycles.indexOf(current) + 1) % cycles.length;
            const nextVal = cycles[nextIdx] || 8;
            currentSettings.repeatCycle = nextVal;
            if (repeatCycleInput) repeatCycleInput.value = nextVal;
            saveCurrentSettings();
            if (window.visaraAPI) {
                window.visaraAPI.getSettings().then(s => {
                    if (s && s.stats) updateStatsUI(s.stats);
                });
            }
        });
    }

    // Sound Selection & Immediate Audio Preview
    if (soundSelect) {
        soundSelect.addEventListener('change', (e) => {
            currentSettings.soundTone = e.target.value;
            saveCurrentSettings();
            if (typeof playNotificationSound === 'function') {
                playNotificationSound(currentSettings.soundTone);
            }
        });
    }

    if (btnPreviewSound) {
        btnPreviewSound.addEventListener('click', () => {
            const tone = (soundSelect && soundSelect.value) || currentSettings.soundTone || 'chime';
            if (typeof playNotificationSound === 'function') {
                playNotificationSound(tone);
            }
        });
    }

    // Chime Toggle
    if (chimeToggle) {
        chimeToggle.addEventListener('click', () => {
            currentSettings.notificationChime = !currentSettings.notificationChime;
            chimeToggle.classList.toggle('active', currentSettings.notificationChime);
            saveCurrentSettings();
        });
    }

    // Auto-Start Toggle
    if (autoStartToggle) {
        autoStartToggle.addEventListener('click', () => {
            currentSettings.autoStartNext = !currentSettings.autoStartNext;
            autoStartToggle.classList.toggle('active', currentSettings.autoStartNext);
            saveCurrentSettings();
        });
    }

    // Dynamic Island PIP Toggle
    if (pipToggle) {
        pipToggle.addEventListener('click', () => {
            currentSettings.dynamicIslandPip = !currentSettings.dynamicIslandPip;
            pipToggle.classList.toggle('active', currentSettings.dynamicIslandPip);
            saveCurrentSettings();
        });
    }

    // Open Customization Studio Page
    if (btnOpenCustomization) {
        btnOpenCustomization.addEventListener('click', () => {
            window.location.href = 'customization.html';
        });
    }

    // Controls
    if (btnTogglePlay) {
        btnTogglePlay.addEventListener('click', () => {
            if (window.visaraAPI) window.visaraAPI.toggleTimer();
        });
    }

    if (btnStartRest) {
        btnStartRest.addEventListener('click', () => {
            if (window.visaraAPI) window.visaraAPI.startRestNow();
        });
    }

    // Presets Drawer
    if (btnAddPreset && popover) {
        btnAddPreset.addEventListener('click', () => {
            popover.classList.add('show');
        });
    }

    if (btnDismissPreset && popover) {
        btnDismissPreset.addEventListener('click', () => {
            popover.classList.remove('show');
        });
    }

    if (preset20 && popover) {
        preset20.addEventListener('click', () => {
            currentSettings.workDuration = 20;
            currentSettings.workUnit = 'MIN';
            currentSettings.restDuration = 20;
            currentSettings.restUnit = 'SEC';
            updateUIFromSettings();
            saveCurrentSettings();
            popover.classList.remove('show');
        });
    }

    if (preset50 && popover) {
        preset50.addEventListener('click', () => {
            currentSettings.workDuration = 50;
            currentSettings.workUnit = 'MIN';
            currentSettings.restDuration = 10;
            currentSettings.restUnit = 'MIN';
            updateUIFromSettings();
            saveCurrentSettings();
            popover.classList.remove('show');
        });
    }

    if (preset5 && popover) {
        preset5.addEventListener('click', () => {
            currentSettings.workDuration = 5;
            currentSettings.workUnit = 'MIN';
            currentSettings.restDuration = 30;
            currentSettings.restUnit = 'SEC';
            updateUIFromSettings();
            saveCurrentSettings();
            popover.classList.remove('show');
        });
    }

    // Window Header Action Buttons
    if (btnMinimize) {
        btnMinimize.addEventListener('click', () => {
            if (window.visaraAPI) window.visaraAPI.minimizeWindow();
        });
    }

    if (btnMaximize) {
        btnMaximize.addEventListener('click', () => {
            if (window.visaraAPI) window.visaraAPI.maximizeWindow();
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            if (window.visaraAPI) window.visaraAPI.closeWindow();
        });
    }

    // ==========================================================================
    // Global Windows Hotkeys & Custom Key Recorder Controller
    // ==========================================================================
    const btnOpenHotkeysModal = document.getElementById('btnOpenHotkeysModal');
    const commandPaletteModal = document.getElementById('commandPaletteModal');
    const paletteSearchInput = document.getElementById('paletteSearchInput');
    const paletteList = document.getElementById('paletteList');

    const hotkeysQuickToggle = document.getElementById('hotkeysQuickToggle');
    const hotkeysModalToggle = document.getElementById('hotkeysModalToggle');

    let currentHotkeys = {
        enabled: true,
        commandPalette: 'CommandOrControl+Shift+Space',
        toggleTimer: 'CommandOrControl+Alt+T',
        startRest: 'CommandOrControl+Alt+R',
        addTime: 'CommandOrControl+Alt+A',
        resetTimer: 'CommandOrControl+Alt+X'
    };

    let activeRecordingBtn = null;

    function formatElectronShortcutToDisplay(str) {
        if (!str) return 'None';
        return str
            .replace(/CommandOrControl/g, 'Ctrl')
            .replace(/Control/g, 'Ctrl')
            .replace(/\+/g, ' + ');
    }

    function formatKeyToElectronName(key) {
        if (key === ' ') return 'Space';
        if (key.length === 1) return key.toUpperCase();
        return key;
    }

    function updateHotkeyPillLabels() {
        const hkCommandPalette = document.getElementById('hkCommandPalette');
        const hkToggleTimer = document.getElementById('hkToggleTimer');
        const hkStartRest = document.getElementById('hkStartRest');
        const hkAddTime = document.getElementById('hkAddTime');
        const hkResetTimer = document.getElementById('hkResetTimer');

        if (hkCommandPalette) hkCommandPalette.innerText = formatElectronShortcutToDisplay(currentHotkeys.commandPalette);
        if (hkToggleTimer) hkToggleTimer.innerText = formatElectronShortcutToDisplay(currentHotkeys.toggleTimer);
        if (hkStartRest) hkStartRest.innerText = formatElectronShortcutToDisplay(currentHotkeys.startRest);
        if (hkAddTime) hkAddTime.innerText = formatElectronShortcutToDisplay(currentHotkeys.addTime);
        if (hkResetTimer) hkResetTimer.innerText = formatElectronShortcutToDisplay(currentHotkeys.resetTimer);
    }

    function renderHotkeysToggleUI() {
        [hotkeysQuickToggle, hotkeysModalToggle].forEach((t) => {
            if (t) {
                if (currentHotkeys.enabled) t.classList.add('active');
                else t.classList.remove('active');
            }
        });
    }

    function saveHotkeySettings() {
        if (window.visaraAPI && window.visaraAPI.registerHotkeys) {
            window.visaraAPI.registerHotkeys(currentHotkeys);
        }
        updateHotkeyPillLabels();
    }

    [hotkeysQuickToggle, hotkeysModalToggle].forEach((t) => {
        if (t) {
            t.addEventListener('click', (e) => {
                e.stopPropagation();
                currentHotkeys.enabled = !currentHotkeys.enabled;
                renderHotkeysToggleUI();
                saveHotkeySettings();
            });
        }
    });

    function stopKeyRecording() {
        if (activeRecordingBtn) {
            activeRecordingBtn.style.background = '#ffffff';
            activeRecordingBtn.style.borderColor = '#e2e8f0';
            activeRecordingBtn.style.color = '#000000';
            updateHotkeyPillLabels();
            activeRecordingBtn = null;
        }
    }

    // Attach click listeners to all hotkey recorder pills
    document.querySelectorAll('.hotkey-recorder-pill').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeRecordingBtn === btn) {
                stopKeyRecording();
                return;
            }
            stopKeyRecording();
            activeRecordingBtn = btn;
            btn.style.background = '#e0f2fe';
            btn.style.borderColor = '#0284c7';
            btn.style.color = '#0284c7';
            btn.innerText = 'Press keys...';
        });
    });

    function openCommandPalette() {
        if (commandPaletteModal) {
            commandPaletteModal.style.display = 'flex';
            if (paletteSearchInput) {
                paletteSearchInput.value = '';
                paletteSearchInput.focus();
            }
        }
    }

    function closeCommandPalette() {
        stopKeyRecording();
        if (commandPaletteModal) commandPaletteModal.style.display = 'none';
    }

    if (btnOpenHotkeysModal) {
        btnOpenHotkeysModal.addEventListener('click', openCommandPalette);
    }

    if (btnOpenPalette) {
        btnOpenPalette.addEventListener('click', openCommandPalette);
    }

    if (window.visaraAPI && window.visaraAPI.onOpenCommandPalette) {
        window.visaraAPI.onOpenCommandPalette(openCommandPalette);
    }

    // Keydown listener for recording custom key combos OR closing modal
    document.addEventListener('keydown', (e) => {
        if (activeRecordingBtn) {
            // Ignore single modifier key presses
            if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            const modifiers = [];
            if (e.ctrlKey) modifiers.push('CommandOrControl');
            if (e.altKey) modifiers.push('Alt');
            if (e.shiftKey) modifiers.push('Shift');

            const mainKey = formatKeyToElectronName(e.key);
            const electronShortcut = [...modifiers, mainKey].join('+');

            const actionKey = activeRecordingBtn.dataset.action;
            if (actionKey) {
                currentHotkeys[actionKey] = electronShortcut;
                saveHotkeySettings();
            }

            stopKeyRecording();
            return;
        }

        if (e.key === 'Escape') {
            closeCommandPalette();
        }
    });

    document.addEventListener('click', () => {
        stopKeyRecording();
    });

    if (commandPaletteModal) {
        commandPaletteModal.addEventListener('click', (e) => {
            if (e.target === commandPaletteModal) closeCommandPalette();
        });
    }

    // Command List Items Click (excluding recorder buttons)
    if (paletteList) {
        paletteList.addEventListener('click', (e) => {
            if (e.target.closest('.hotkey-recorder-pill')) return;
            const item = e.target.closest('.cmd-item');
            if (item) {
                const cmd = item.dataset.cmd;
                if (window.visaraAPI && window.visaraAPI.executeCommand) {
                    window.visaraAPI.executeCommand(cmd);
                }
                closeCommandPalette();
            }
        });
    }

    // Filter Palette Commands on Type
    if (paletteSearchInput && paletteList) {
        paletteSearchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const items = paletteList.querySelectorAll('.cmd-item');
            items.forEach((item) => {
                const text = item.textContent.toLowerCase();
                if (text.includes(q)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // ==========================================================================
    // Firebase Google Authentication & Profile Sync Controller
    // ==========================================================================
    function updateAuthUI(user) {
        if (user) {
            // Keep the dashboard available while optionally syncing an account.
            if (mainDashboardScreen) mainDashboardScreen.style.display = 'flex';

            if (window.visaraAPI && window.visaraAPI.setSessionActive) {
                window.visaraAPI.setSessionActive(true);
            }

            if (userAvatarMini) {
                if (user.photoURL) {
                    userAvatarMini.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}">`;
                } else {
                    const initial = (user.displayName || 'V').charAt(0).toUpperCase();
                    userAvatarMini.innerHTML = initial;
                }
            }

            if (drawerAvatar) {
                if (user.photoURL) {
                    drawerAvatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}">`;
                } else {
                    const initial = (user.displayName || 'V').charAt(0).toUpperCase();
                    drawerAvatar.innerHTML = initial;
                }
            }

            const firstName = (user.displayName || 'User').split(' ')[0];
            if (userNameMini) userNameMini.textContent = firstName;
            if (drawerName) drawerName.textContent = user.displayName || 'Visara User';
            if (drawerEmail) drawerEmail.textContent = user.email || 'Local Mode';

            if (drawerStatusBadge) {
                if (user.isAnonymous) {
                    drawerStatusBadge.textContent = '● Local';
                    drawerStatusBadge.style.color = 'var(--text-secondary)';
                    drawerStatusBadge.style.background = 'rgba(0,0,0,0.06)';
                } else {
                    drawerStatusBadge.textContent = '● Google Synced';
                    drawerStatusBadge.style.color = 'var(--accent-green)';
                    drawerStatusBadge.style.background = 'rgba(52, 199, 89, 0.1)';
                }
            }
        } else {
            if (window.visaraAPI && window.visaraAPI.setSessionActive) {
                window.visaraAPI.setSessionActive(true);
            }

            if (userAvatarMini) userAvatarMini.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
            if (userNameMini) userNameMini.textContent = 'Local';
            if (drawerName) drawerName.textContent = 'Local User';
            if (drawerEmail) drawerEmail.textContent = 'Offline Mode';
            if (drawerStatusBadge) drawerStatusBadge.textContent = '● Offline';
        }
    }

    // Connect Auth State Listener
    authManager.onAuthStateChange((user) => {
        updateAuthUI(user);
    });

    // ==========================================================================
    // Suggest a Feature Action Link
    // ==========================================================================
    const btnOpenSuggest = document.getElementById('btnOpenSuggest');

    if (btnOpenSuggest) {
        btnOpenSuggest.addEventListener('click', () => {
            const url = 'https://forms.gle/vU2kMukjDGvUPwtB8';
            if (window.visaraAPI && window.visaraAPI.openExternal) {
                window.visaraAPI.openExternal(url);
            } else {
                window.open(url, '_blank');
            }
            trackVisaraEvent('suggest_feature_click', { url });
        });
    }

    // Track initial app launch telemetry
    trackVisaraEvent('app_open', { screen: 'dashboard' });
});
