// app/src/hooks/useSound.js
import { useCallback } from 'react';

export function useSound() {
    const playClunk = useCallback(() => {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(150, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(40, context.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.start();
            oscillator.stop(context.currentTime + 0.1);
        } catch (e) {
            console.warn('AudioContext not supported or blocked:', e);
        }
    }, []);

    return { playClunk };
}
