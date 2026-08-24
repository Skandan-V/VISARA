// Web Audio API Sound Synthesizer for Visara (Rich Sound Library & Exercise Step Chimes)

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Synthesize a single pure or harmonic tone
function playTone(ctx, freq, startTime, duration = 0.5, gainVal = 0.15, waveType = 'sine') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
}

// Specialized water droplet synthesizer with pitch glides
function playWaterDrop(ctx, startTime) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, startTime);
    osc.frequency.exponentialRampToValueAtTime(2200, startTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1400, startTime + 0.18);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.3);
}

// Master sound notification dispatcher supporting 7 distinct soothing sound profiles
function playNotificationSound(soundName = 'chime') {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        switch (soundName) {
            case 'bowl':
                // Tibetan Singing Bowl: warm, meditative resonant tone
                playTone(ctx, 216.0, now, 1.8, 0.22, 'sine');
                playTone(ctx, 432.0, now + 0.02, 1.6, 0.18, 'sine');
                playTone(ctx, 648.0, now + 0.05, 1.2, 0.08, 'sine');
                break;

            case 'marimba':
                // Marimba Arpeggio: crisp, wooden mallet hits
                playTone(ctx, 523.25, now, 0.28, 0.18, 'triangle');
                playTone(ctx, 659.25, now + 0.08, 0.28, 0.18, 'triangle');
                playTone(ctx, 783.99, now + 0.16, 0.28, 0.18, 'triangle');
                playTone(ctx, 1046.50, now + 0.24, 0.35, 0.22, 'triangle');
                break;

            case 'bell':
                // Zen Temple Bell: 528Hz pure frequency with harmonic shimmer
                playTone(ctx, 528.0, now, 1.6, 0.22, 'sine');
                playTone(ctx, 1056.0, now + 0.01, 1.2, 0.12, 'sine');
                playTone(ctx, 1584.0, now + 0.02, 0.8, 0.05, 'sine');
                break;

            case 'drop':
                // Water Drop Pop: pitch-swept bubble tone
                playWaterDrop(ctx, now);
                break;

            case 'harp':
                // Soft Harp Chord: soothing acoustic strum
                playTone(ctx, 293.66, now, 0.8, 0.15, 'sine');
                playTone(ctx, 369.99, now + 0.06, 0.8, 0.15, 'sine');
                playTone(ctx, 440.00, now + 0.12, 0.8, 0.16, 'sine');
                playTone(ctx, 587.33, now + 0.18, 1.0, 0.20, 'sine');
                break;

            case 'digital':
                // Digital Pip: clean modern tech notification
                playTone(ctx, 880.0, now, 0.12, 0.16, 'sine');
                playTone(ctx, 1760.0, now + 0.09, 0.22, 0.20, 'sine');
                break;

            case 'chime':
            default:
                // Gentle Chime: classic crystal double bell (C6 -> E6)
                playTone(ctx, 1046.50, now, 0.6, 0.15, 'sine');
                playTone(ctx, 1318.51, now + 0.12, 0.8, 0.18, 'sine');
                break;
        }
    } catch (e) {
        console.warn('Audio playback prevented or unsupported:', e);
    }
}

// Backwards compatibility for gentle chime call
function playGentleChime() {
    playNotificationSound('chime');
}

// Distinct sound for each exercise step (Step 0, 1, 2, 3)
function playStepChime(stepIndex = 0, soundName) {
    if (stepIndex === 0) {
        playNotificationSound(soundName || 'chime');
        return;
    }

    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        if (stepIndex === 1) {
            // Step 2 (Eye Rolling): Ascending 3-note arpeggio (G5 -> B5 -> D6)
            playTone(ctx, 783.99, now, 0.4, 0.12);
            playTone(ctx, 987.77, now + 0.1, 0.4, 0.12);
            playTone(ctx, 1174.66, now + 0.2, 0.6, 0.18);
        } else if (stepIndex === 2) {
            // Step 3 (Scanning): Dual-tone resonant ping (F5 -> C6)
            playTone(ctx, 698.46, now, 0.5, 0.15);
            playTone(ctx, 1046.50, now + 0.15, 0.7, 0.22);
        } else if (stepIndex === 3) {
            // Step 4 (Blinking & Refresh): Deep soothing warm chord (A4 -> E5 -> A5)
            playTone(ctx, 440.00, now, 0.5, 0.2);
            playTone(ctx, 659.25, now + 0.1, 0.5, 0.2);
            playTone(ctx, 880.00, now + 0.2, 0.7, 0.3);
        }
    } catch (e) {
        console.warn('Audio playback prevented or unsupported:', e);
    }
}

// Expose globally to window
if (typeof window !== 'undefined') {
    window.playNotificationSound = playNotificationSound;
    window.playGentleChime = playGentleChime;
    window.playStepChime = playStepChime;
}
