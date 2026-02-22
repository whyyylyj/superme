// audio-manager.js

const AudioManager = {
    audioCtx: null,
    muted: false,
    volume: 0.3,

    init() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    },

    /**
     * 播放简单音调
     */
    playTone(frequency, duration, type = 'square', volume = null) {
        if (this.muted || !this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
        osc.frequency.value = frequency;
        gain.gain.value = volume || this.volume;

        // 渐弱
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    },

    // 预定义音效
    sfx: {
        shoot() {
            AudioManager.playTone(800, 0.05, 'square', 0.15);
        },

        hit() {
            AudioManager.playTone(200, 0.1, 'sawtooth', 0.2);
        },

        explosion() {
            AudioManager.playTone(100, 0.3, 'sawtooth', 0.3);
            setTimeout(() => AudioManager.playTone(60, 0.2, 'sawtooth', 0.2), 100);
        },

        powerup() {
            AudioManager.playTone(523, 0.1, 'sine', 0.2); // C5
            setTimeout(() => AudioManager.playTone(659, 0.1, 'sine', 0.2), 100); // E5
            setTimeout(() => AudioManager.playTone(784, 0.15, 'sine', 0.2), 200); // G5
        },

        transform() {
            AudioManager.playTone(261, 0.1, 'square', 0.2);
            setTimeout(() => AudioManager.playTone(329, 0.1, 'square', 0.2), 80);
            setTimeout(() => AudioManager.playTone(392, 0.1, 'square', 0.2), 160);
            setTimeout(() => AudioManager.playTone(523, 0.2, 'square', 0.25), 240);
        },

        jump() {
            AudioManager.playTone(400, 0.08, 'sine', 0.1);
            setTimeout(() => AudioManager.playTone(600, 0.08, 'sine', 0.1), 50);
        },

        damage() {
            AudioManager.playTone(150, 0.15, 'square', 0.25);
            AudioManager.playTone(100, 0.15, 'sawtooth', 0.2);
        },

        bossAppear() {
            AudioManager.playTone(100, 0.3, 'square', 0.3);
            setTimeout(() => AudioManager.playTone(80, 0.3, 'square', 0.3), 300);
            setTimeout(() => AudioManager.playTone(60, 0.5, 'square', 0.35), 600);
        },

        bossDefeat() {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    AudioManager.playTone(200 + i * 100, 0.15, 'square', 0.2);
                }, i * 100);
            }
        },

        levelClear() {
            const notes = [523, 587, 659, 784, 880, 988, 1047];
            notes.forEach((freq, i) => {
                setTimeout(() => AudioManager.playTone(freq, 0.15, 'sine', 0.2), i * 120);
            });
        },

        menuSelect() {
            AudioManager.playTone(600, 0.05, 'sine', 0.15);
        },

        gameOver() {
            const notes = [392, 349, 330, 262];
            notes.forEach((freq, i) => {
                setTimeout(() => AudioManager.playTone(freq, 0.3, 'sine', 0.2), i * 300);
            });
        }
    },

    toggleMute() {
        this.muted = !this.muted;
    }
};
