// Exercise Canvas Animation & Step Controller (Distinct Audio Routines per Step)

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('exerciseCanvas');
    const ctx = canvas.getContext('2d');
    const restTimerDisplay = document.getElementById('restTimerDisplay');
    const exerciseTitle = document.getElementById('exerciseTitle');
    const exerciseDesc = document.getElementById('exerciseDesc');
    const stepIndicators = document.querySelectorAll('.step-indicator');

    const btnComplete = document.getElementById('btnComplete');
    const btnSkip = document.getElementById('btnSkip');
    const btnSnooze = document.getElementById('btnSnooze');

    let currentStep = 0;
    let secondsLeft = 20;
    let totalRestSeconds = 20;
    let animId = null;
    let startTime = Date.now();

    const routines = [
        {
            title: "1. Far Gaze Focus (20-20-20 Rule)",
            desc: "Look away from your screen at an object 20 feet (6m) away. Relax your vision and breathe deeply.",
            draw: drawFarGaze
        },
        {
            title: "2. Guided Circular Eye Rolling",
            desc: "Follow the glowing dot with your eyes without turning your head. Smoothly trace the circle.",
            draw: drawEyeRolling
        },
        {
            title: "3. Horizontal & Vertical Scanning",
            desc: "Track the orb as it moves horizontally and vertically to stretch your extraocular muscles.",
            draw: drawGazeScanning
        },
        {
            title: "4. Gentle Blinking & Refresh",
            desc: "Blink gently each time the pulse expands to lubricate your eyes and reduce dryness.",
            draw: drawBlinkingGuide
        }
    ];

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (window.visaraAPI) {
        let activeSoundTone = 'chime';

        window.visaraAPI.onTimerTick((data) => {
            if (data.isResting) {
                secondsLeft = data.secondsLeft;
                updateRestTimerDisplay(secondsLeft);
                
                const progress = 1 - (secondsLeft / Math.max(1, totalRestSeconds));
                const newStep = Math.min(3, Math.floor(progress * 4));
                if (newStep !== currentStep) {
                    setStep(newStep);
                    // Play distinct sound routine per exercise step
                    if (typeof playStepChime === 'function') {
                        playStepChime(newStep, activeSoundTone);
                    }
                }
            }
        });

        window.visaraAPI.onExerciseStart((data) => {
            totalRestSeconds = data.restDuration || 20;
            secondsLeft = totalRestSeconds;
            activeSoundTone = data.soundTone || 'chime';
            updateRestTimerDisplay(secondsLeft);
            setStep(0);
            resizeCanvas();
            if (data.playChime && typeof playNotificationSound === 'function') {
                playNotificationSound(activeSoundTone);
            }
        });
    }

    function updateRestTimerDisplay(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        restTimerDisplay.innerText = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    }

    function setStep(idx) {
        currentStep = idx;
        exerciseTitle.innerText = routines[idx].title;
        exerciseDesc.innerText = routines[idx].desc;
        stepIndicators.forEach((el, i) => {
            if (i === idx) el.classList.add('active');
            else el.classList.remove('active');
        });
    }

    // Animation Loop
    function render() {
        resizeCanvas();
        const elapsed = (Date.now() - startTime) / 1000;
        const width = canvas.width || 320;
        const height = canvas.height || 320;
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);

        if (routines[currentStep]) {
            routines[currentStep].draw(ctx, centerX, centerY, width, height, elapsed);
        }

        animId = requestAnimationFrame(render);
    }

    // Routine 1: Far Gaze Breathing Ring
    function drawFarGaze(ctx, cx, cy, w, h, t) {
        const baseR = Math.min(w, h) * 0.15;
        const pulse = (Math.sin(t * 1.5) + 1) / 2;
        const radius = baseR + pulse * (baseR * 1.2);

        ctx.beginPath();
        ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 199, 89, ${0.08 + pulse * 0.1})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#34c759';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
    }

    // Routine 2: Circular Eye Rolling Dot
    function drawEyeRolling(ctx, cx, cy, w, h, t) {
        const trackRadius = Math.min(w, h) * 0.32;

        ctx.beginPath();
        ctx.arc(cx, cy, trackRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 2;
        ctx.stroke();

        const speed = 1.2;
        const angle = t * speed;
        const orbX = cx + Math.cos(angle) * trackRadius;
        const orbY = cy + Math.sin(angle) * trackRadius;

        ctx.beginPath();
        ctx.arc(orbX, orbY, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#34c759';
        ctx.shadowColor = 'rgba(52, 199, 89, 0.4)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Routine 3: Horizontal & Vertical Smooth Pursuit
    function drawGazeScanning(ctx, cx, cy, w, h, t) {
        const cycle = t % 6;
        let orbX = cx;
        let orbY = cy;
        const range = Math.min(w, h) * 0.35;

        if (cycle < 3) {
            const norm = (Math.sin((cycle / 3) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
            orbX = cx - range + norm * (range * 2);
        } else {
            const norm = (Math.sin(((cycle - 3) / 3) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
            orbY = cy - range + norm * (range * 2);
        }

        ctx.beginPath();
        ctx.moveTo(cx - range, cy);
        ctx.lineTo(cx + range, cy);
        ctx.moveTo(cx, cy - range);
        ctx.lineTo(cx, cy + range);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(orbX, orbY, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
    }

    // Routine 4: Rhythmic Blinking Guide (Sharp Eye Edges)
    function drawBlinkingGuide(ctx, cx, cy, w, h, t) {
        const blinkPulse = (Math.sin(t * 3) + 1) / 2;
        const eyeWidth = Math.min(w, h) * 0.28;
        const maxH = Math.min(w, h) * 0.16;
        const openHeight = Math.max(1, maxH * blinkPulse);
        const leftX = cx - eyeWidth;
        const rightX = cx + eyeWidth;

        ctx.save();

        // 1. Sharp Eye Almond Contour (Curved upper and lower eyelids meeting at sharp pointed vertices)
        ctx.beginPath();
        ctx.moveTo(leftX, cy);
        // Upper eyelid arch
        ctx.bezierCurveTo(
            cx - eyeWidth * 0.55, cy - openHeight * 1.25,
            cx + eyeWidth * 0.55, cy - openHeight * 1.25,
            rightX, cy
        );
        // Lower eyelid arch back to sharp left corner
        ctx.bezierCurveTo(
            cx + eyeWidth * 0.55, cy + openHeight * 1.25,
            cx - eyeWidth * 0.55, cy + openHeight * 1.25,
            leftX, cy
        );
        ctx.closePath();

        // Subtle soft green fill within the eye cavity
        ctx.fillStyle = `rgba(52, 199, 89, ${0.04 + blinkPulse * 0.06})`;
        ctx.fill();

        // Sharp outer eyelid stroke
        ctx.strokeStyle = '#34c759';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 10;
        ctx.stroke();

        // Clip inner eye elements (iris & pupil) inside the sharp eyelid boundaries
        ctx.clip();

        // 2. Iris and Pupil Details (clipped neatly inside eyelids)
        if (openHeight > 4) {
            const pupilScale = openHeight / maxH;

            // Iris ring
            const irisRadius = Math.min(w, h) * 0.085;
            ctx.beginPath();
            ctx.arc(cx, cy, irisRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(52, 199, 89, 0.25)';
            ctx.fill();
            ctx.strokeStyle = '#34c759';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Center pupil
            const pupilRadius = Math.min(w, h) * 0.045 * Math.max(0.6, pupilScale);
            ctx.beginPath();
            ctx.arc(cx, cy, pupilRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#111827';
            ctx.fill();

            // Specular catchlight reflection
            ctx.beginPath();
            ctx.arc(cx - pupilRadius * 0.35, cy - pupilRadius * 0.35, pupilRadius * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fill();
        }

        ctx.restore();
    }

    // Controls Action Listeners
    btnComplete.addEventListener('click', () => {
        if (window.visaraAPI) window.visaraAPI.completeExercise();
    });

    btnSkip.addEventListener('click', () => {
        if (window.visaraAPI) window.visaraAPI.skipExercise();
    });

    btnSnooze.addEventListener('click', () => {
        if (window.visaraAPI) window.visaraAPI.snoozeExercise(5);
    });

    // Start Animation
    render();
});
