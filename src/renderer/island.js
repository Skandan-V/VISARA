// Dynamic Island PIP Controller (Native Mouse Event Pass-Through & Valorant Shard Loader)

document.addEventListener('DOMContentLoaded', () => {
    const island = document.getElementById('island');
    const islandAvatar = document.getElementById('islandAvatar');
    const islandTimer = document.getElementById('islandTimer');

    const islandAdd5m = document.getElementById('islandAdd5m');
    const islandRestBtn = document.getElementById('islandRestBtn');
    const islandCloseBtn = document.getElementById('islandCloseBtn');
    const islandToggleBtn = document.getElementById('islandToggleBtn');
    const islandPlayIcon = document.getElementById('islandPlayIcon');

    const compassAnim = document.getElementById('compassAnim');
    const hamsterAnim = document.getElementById('hamsterAnim');
    const pulseAnim = document.getElementById('pulseAnim');
    const orbiterAnim = document.getElementById('orbiterAnim');
    const pencilAnim = document.getElementById('pencilAnim');
    const pokeballAnim = document.getElementById('pokeballAnim');
    const radarAnim = document.getElementById('radarAnim');
    const infinityAnim = document.getElementById('infinityAnim');
    const conicAnim = document.getElementById('conicAnim');
    const diamondAnim = document.getElementById('diamondAnim');
    const monsterAnim = document.getElementById('monsterAnim');
    const fireAnim = document.getElementById('fireAnim');
    const valorantAnim = document.getElementById('valorantAnim');
    const suncloudAnim = document.getElementById('suncloudAnim');

    function applyCustomStyles(s) {
        if (!s) return;
        
        // Animation Toggle & No Animation Centered Mode
        const anim = s.islandAnimation || 'hamster';

        if (anim === 'none') {
            if (islandAvatar) islandAvatar.style.display = 'none';
            if (island) island.classList.add('no-anim');
        } else {
            if (islandAvatar) islandAvatar.style.display = 'flex';
            if (island) island.classList.remove('no-anim');

            if (compassAnim) compassAnim.style.display = anim === 'compass' ? 'block' : 'none';
            if (hamsterAnim) hamsterAnim.style.display = anim === 'hamster' ? 'block' : 'none';
            if (pulseAnim) pulseAnim.style.display = anim === 'pulse' ? 'flex' : 'none';
            if (orbiterAnim) orbiterAnim.style.display = anim === 'orbiter' ? 'block' : 'none';
            if (pencilAnim) pencilAnim.style.display = anim === 'pencil' ? 'block' : 'none';
            if (pokeballAnim) pokeballAnim.style.display = anim === 'pokeball' ? 'block' : 'none';
            if (radarAnim) radarAnim.style.display = anim === 'radar' ? 'flex' : 'none';
            if (infinityAnim) infinityAnim.style.display = anim === 'infinity' ? 'flex' : 'none';
            if (conicAnim) conicAnim.style.display = anim === 'conic' ? 'block' : 'none';
            if (diamondAnim) diamondAnim.style.display = anim === 'diamond' ? 'block' : 'none';
            if (monsterAnim) monsterAnim.style.display = anim === 'monster' ? 'block' : 'none';
            if (fireAnim) fireAnim.style.display = anim === 'fire' ? 'block' : 'none';
            if (valorantAnim) valorantAnim.style.display = (anim === 'valorant' || anim === 'shard') ? 'block' : 'none';
            if (suncloudAnim) suncloudAnim.style.display = anim === 'suncloud' ? 'flex' : 'none';
        }

        // Timer Accent Color
        if (islandTimer && s.timerColor) {
            islandTimer.style.color = s.timerColor;
        }

        // Island Background Theme
        if (island && s.islandBg) {
            island.style.backgroundColor = s.islandBg;
        }
    }

    if (window.visaraAPI) {
        window.visaraAPI.getSettings().then((s) => {
            applyCustomStyles(s);
        });

        window.visaraAPI.onStateChange((data) => {
            if (data && data.settings) {
                applyCustomStyles(data.settings);
            }
        });

        window.visaraAPI.onTimerTick((data) => {
            updateIslandTimer(data.secondsLeft);

            if (islandAvatar) {
                if (!data.isRunning) {
                    islandAvatar.classList.add('paused');
                } else {
                    islandAvatar.classList.remove('paused');
                }
            }

            if (data.isResting) {
                islandTimer.classList.add('resting');
            } else {
                islandTimer.classList.remove('resting');
            }

            updatePlayIcon(data.isRunning);
        });
    }

    function updateIslandTimer(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        islandTimer.innerText = `${m}:${s < 10 ? '0' + s : s}`;
    }

    function updatePlayIcon(isRunning) {
        if (isRunning) {
            islandPlayIcon.innerHTML = '<rect x="6" y="5" width="3" height="14" rx="1" fill="currentColor"></rect><rect x="15" y="5" width="3" height="14" rx="1" fill="currentColor"></rect>';
        } else {
            islandPlayIcon.innerHTML = '<polygon points="7 4 19 12 7 20" fill="currentColor"></polygon>';
        }
    }

    // Add +5m Action
    islandAdd5m.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.visaraAPI) window.visaraAPI.addTime(5);
    });

    // Start Rest Break Action
    islandRestBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.visaraAPI) window.visaraAPI.startRestNow();
    });

    // Dismiss Dynamic Island Action (X button)
    islandCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.visaraAPI) window.visaraAPI.dismissIsland();
    });

    // Toggle Play/Pause Action
    islandToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.visaraAPI) window.visaraAPI.toggleTimer();
    });

    // Toggle timer on pill body click (if not clicking an action button)
    island.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            if (window.visaraAPI) window.visaraAPI.toggleTimer();
        }
    });

    // NATIVE PASS-THROUGH: Default to pass-through so clicks in transparent areas pass right to Windows behind!
    if (window.visaraAPI && window.visaraAPI.setIgnoreMouseEvents) {
        window.visaraAPI.setIgnoreMouseEvents(true, { forward: true });
    }

    let hoverTimeout = null;

    island.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        if (window.visaraAPI && window.visaraAPI.setIgnoreMouseEvents) {
            window.visaraAPI.setIgnoreMouseEvents(false);
        }
        island.classList.add('expanded');
    });

    island.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            island.classList.remove('expanded');
            if (window.visaraAPI && window.visaraAPI.setIgnoreMouseEvents) {
                window.visaraAPI.setIgnoreMouseEvents(true, { forward: true });
            }
        }, 250);
    });
});
