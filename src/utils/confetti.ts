import confetti from 'canvas-confetti';

export const fireVictoryConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#3b82f6', '#10b981', '#fbbf24']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#3b82f6', '#10b981', '#fbbf24']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    };

    // --- Reproducir Trompetas de Victoria (Web Audio API) ---
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            
            const playNote = (freq: number, startTime: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                osc.type = 'sawtooth'; // Sonido similar a metales/trompetas retro
                osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
                
                gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
                gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + startTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
                
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                osc.start(ctx.currentTime + startTime);
                osc.stop(ctx.currentTime + startTime + duration);
            };

            // Ta-da-da-DAA! (Fanfarria estilo Final Fantasy/Mario)
            const bpm = 120;
            const quarter = 60 / bpm;
            playNote(392.00, 0, quarter * 0.3);        // G4
            playNote(392.00, quarter * 0.3, quarter * 0.3);  // G4
            playNote(392.00, quarter * 0.6, quarter * 0.3);  // G4
            playNote(523.25, quarter * 0.9, quarter * 1.5);  // C5
        }
    } catch(e) {
        console.warn('Audio not supported or blocked by browser');
    }

    frame();
};
