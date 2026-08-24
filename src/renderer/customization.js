// Dedicated Dynamic Island Customization Page Controller (14 Animation Options & Auto Accent Colors)

document.addEventListener('DOMContentLoaded', () => {
    const btnBack = document.getElementById('btnBack');
    const btnMinimize = document.getElementById('btnMinimize');
    const btnMaximize = document.getElementById('btnMaximize');
    const btnClose = document.getElementById('btnClose');
    const btnApply = document.getElementById('btnApplyCustomizations');

    // Live Preview Elements
    const previewIsland = document.getElementById('previewIsland');
    const previewAvatar = document.getElementById('previewAvatar');
    const previewTimer = document.getElementById('previewTimer');

    const prevCompass = document.getElementById('prevCompass');
    const prevHamster = document.getElementById('prevHamster');
    const prevPulse = document.getElementById('prevPulse');
    const prevOrbiter = document.getElementById('prevOrbiter');
    const prevPencil = document.getElementById('prevPencil');
    const prevPokeball = document.getElementById('prevPokeball');
    const prevRadar = document.getElementById('prevRadar');
    const prevInfinity = document.getElementById('prevInfinity');
    const prevConic = document.getElementById('prevConic');
    const prevDiamond = document.getElementById('prevDiamond');
    const prevMonster = document.getElementById('prevMonster');
    const prevFire = document.getElementById('prevFire');
    const prevValorant = document.getElementById('prevValorant');
    const prevSuncloud = document.getElementById('prevSuncloud');

    // Circular Swatches & Input Pickers
    const animSwatches = document.querySelectorAll('.circle-anim-swatch');
    const timerColorPalette = document.getElementById('timerColorPalette');
    const bgThemePalette = document.getElementById('bgThemePalette');

    const timerColorInput = document.getElementById('timerColorInput');
    const bgColorInput = document.getElementById('bgColorInput');

    const ANIM_THEME_COLORS = {
        none: '#38bdf8',
        hamster: '#f97316',
        compass: '#38bdf8',
        pulse: '#34c759',
        orbiter: '#00f2fe',
        pencil: '#3b82f6',
        pokeball: '#f93318',
        radar: '#fc5185',
        infinity: '#ec4899',
        conic: '#60a5fa',
        diamond: '#ff6b6b',
        monster: '#00b4d8',
        fire: '#ef5a00',
        valorant: '#ff4c5a',
        shard: '#ff4c5a',
        suncloud: '#fcbb04'
    };

    let currentSettings = {
        islandAnimation: 'hamster',
        timerColor: '#f97316',
        islandBg: '#000000',
        recentTimerColors: ['#f97316', '#38bdf8', '#34c759', '#00f2fe', '#3b82f6', '#f93318'],
        recentBgColors: ['#000000', '#1c1c1e', '#0b1329', '#061a12']
    };

    // Load initial settings
    if (window.visaraAPI) {
        window.visaraAPI.getSettings().then((s) => {
            currentSettings = { ...currentSettings, ...s };
            if (!currentSettings.recentTimerColors) {
                currentSettings.recentTimerColors = ['#f97316', '#38bdf8', '#34c759', '#00f2fe', '#3b82f6', '#f93318'];
            }
            if (!currentSettings.recentBgColors) {
                currentSettings.recentBgColors = ['#000000', '#1c1c1e', '#0b1329', '#061a12'];
            }
            updateCustomizationUI();
        });
    }

    function updateCustomizationUI() {
        // Render Single-Line Timer Color Swatches (max 6 swatches in 1 line!)
        renderColorPalette(timerColorPalette, currentSettings.recentTimerColors, currentSettings.timerColor, timerColorInput, (selectedColor) => {
            currentSettings.timerColor = selectedColor;
            updateCustomizationUI();
        });

        // Render Single-Line BG Theme Swatches (max 6 swatches in 1 line!)
        renderColorPalette(bgThemePalette, currentSettings.recentBgColors, currentSettings.islandBg, bgColorInput, (selectedBg) => {
            currentSettings.islandBg = selectedBg;
            updateCustomizationUI();
        });

        // Active Anim Circular Swatch
        animSwatches.forEach((swatch) => {
            const anim = swatch.dataset.anim;
            if (anim === currentSettings.islandAnimation || (anim === 'valorant' && currentSettings.islandAnimation === 'shard')) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });

        // Apply to Live Preview Stage
        renderLivePreview();
    }

    function renderColorPalette(paletteContainer, colorsArray, activeColorHex, hiddenInput, onSelect) {
        const addBtnLabel = paletteContainer.querySelector('.add-custom-swatch');
        paletteContainer.innerHTML = '';

        const maxSingleLine = 6;
        const displayColors = colorsArray.slice(0, maxSingleLine);

        displayColors.forEach((colorHex) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            if (colorHex.toLowerCase() === (activeColorHex || '').toLowerCase()) {
                swatch.classList.add('active');
            }
            swatch.style.backgroundColor = colorHex;
            swatch.title = colorHex;
            swatch.addEventListener('click', () => onSelect(colorHex));
            paletteContainer.appendChild(swatch);
        });

        if (addBtnLabel) {
            paletteContainer.appendChild(addBtnLabel);
        }
    }

    function renderLivePreview() {
        // Animation
        const anim = currentSettings.islandAnimation || 'hamster';

        if (anim === 'none') {
            if (previewAvatar) previewAvatar.style.display = 'none';
            if (previewIsland) previewIsland.classList.add('no-anim');
        } else {
            if (previewAvatar) previewAvatar.style.display = 'flex';
            if (previewIsland) previewIsland.classList.remove('no-anim');

            if (prevCompass) prevCompass.style.display = anim === 'compass' ? 'block' : 'none';
            if (prevHamster) prevHamster.style.display = anim === 'hamster' ? 'block' : 'none';
            if (prevPulse) prevPulse.style.display = anim === 'pulse' ? 'flex' : 'none';
            if (prevOrbiter) prevOrbiter.style.display = anim === 'orbiter' ? 'block' : 'none';
            if (prevPencil) prevPencil.style.display = anim === 'pencil' ? 'block' : 'none';
            if (prevPokeball) prevPokeball.style.display = anim === 'pokeball' ? 'block' : 'none';
            if (prevRadar) prevRadar.style.display = anim === 'radar' ? 'flex' : 'none';
            if (prevInfinity) prevInfinity.style.display = anim === 'infinity' ? 'block' : 'none';
            if (prevConic) prevConic.style.display = anim === 'conic' ? 'block' : 'none';
            if (prevDiamond) prevDiamond.style.display = anim === 'diamond' ? 'block' : 'none';
            if (prevMonster) prevMonster.style.display = anim === 'monster' ? 'block' : 'none';
            if (prevFire) prevFire.style.display = anim === 'fire' ? 'block' : 'none';
            if (prevValorant) prevValorant.style.display = (anim === 'valorant' || anim === 'shard') ? 'block' : 'none';
            if (prevSuncloud) prevSuncloud.style.display = anim === 'suncloud' ? 'flex' : 'none';
        }

        // Timer Color
        if (previewTimer) previewTimer.style.color = currentSettings.timerColor || '#38bdf8';

        // Island Background
        if (previewIsland) previewIsland.style.backgroundColor = currentSettings.islandBg || '#000000';
    }

    // Animation Circular Swatch Listener (Automatically sets signature accent color from animation code)
    animSwatches.forEach((swatch) => {
        swatch.addEventListener('click', () => {
            const anim = swatch.dataset.anim;
            currentSettings.islandAnimation = anim;

            // Automatically assign signature theme color based on animation code
            if (ANIM_THEME_COLORS[anim]) {
                currentSettings.timerColor = ANIM_THEME_COLORS[anim];
                if (!currentSettings.recentTimerColors.includes(ANIM_THEME_COLORS[anim])) {
                    currentSettings.recentTimerColors.unshift(ANIM_THEME_COLORS[anim]);
                    if (currentSettings.recentTimerColors.length > 6) {
                        currentSettings.recentTimerColors.pop();
                    }
                }
            }

            updateCustomizationUI();
        });
    });

    // Handle Custom Timer Color Picker Selection
    if (timerColorInput) {
        timerColorInput.addEventListener('input', (e) => {
            const newColor = e.target.value;
            currentSettings.timerColor = newColor;
            if (previewTimer) previewTimer.style.color = newColor;
        });

        timerColorInput.addEventListener('change', (e) => {
            const newColor = e.target.value;
            currentSettings.timerColor = newColor;
            if (!currentSettings.recentTimerColors.includes(newColor)) {
                currentSettings.recentTimerColors.unshift(newColor);
                if (currentSettings.recentTimerColors.length > 6) {
                    currentSettings.recentTimerColors.pop();
                }
            }
            updateCustomizationUI();
        });
    }

    // Handle Custom BG Color Picker Selection
    if (bgColorInput) {
        bgColorInput.addEventListener('input', (e) => {
            const newBg = e.target.value;
            currentSettings.islandBg = newBg;
            if (previewIsland) previewIsland.style.backgroundColor = newBg;
        });

        bgColorInput.addEventListener('change', (e) => {
            const newBg = e.target.value;
            currentSettings.islandBg = newBg;
            if (!currentSettings.recentBgColors.includes(newBg)) {
                currentSettings.recentBgColors.unshift(newBg);
                if (currentSettings.recentBgColors.length > 6) {
                    currentSettings.recentBgColors.pop();
                }
            }
            updateCustomizationUI();
        });
    }

    // Apply Changes & Save Settings
    if (btnApply) {
        btnApply.addEventListener('click', () => {
            if (window.visaraAPI) {
                window.visaraAPI.saveSettings(currentSettings);
            }
            window.location.href = 'index.html';
        });
    }

    // Navigation & Window Header Actions
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

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
});
