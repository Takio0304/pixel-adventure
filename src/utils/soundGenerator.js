// Web Audio APIを使用してゲームサウンドを生成するユーティリティ

export class SoundGenerator {
    constructor() {
        try {
            if (typeof AudioContext !== 'undefined') {
                this.audioContext = new AudioContext();
            } else if (typeof webkitAudioContext !== 'undefined') {
                this.audioContext = new webkitAudioContext();
            } else {
                console.warn('Web Audio API not supported');
                this.audioContext = null;
            }
        } catch (error) {
            console.error('Failed to create AudioContext:', error);
            this.audioContext = null;
        }
    }

    // ジャンプ音
    createJumpSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // コイン取得音
    createCoinSound() {
        if (!this.audioContext) return;
        
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator1.type = 'square';
        oscillator1.frequency.setValueAtTime(988, this.audioContext.currentTime);
        oscillator1.frequency.setValueAtTime(1319, this.audioContext.currentTime + 0.1);
        
        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(1319, this.audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(1568, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.2);
        oscillator2.start(this.audioContext.currentTime + 0.05);
        oscillator2.stop(this.audioContext.currentTime + 0.2);
    }

    // パワーアップ音
    createPowerUpSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // 敵を踏む音
    createStompSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // ダメージ音
    createDamageSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // ブロックヒット音
    createBlockHitSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(350, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    // ゴール到達音
    createGoalSound() {
        if (!this.audioContext) return;
        
        const notes = [523, 659, 784, 1047]; // C, E, G, C (高)
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.15);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + index * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.15 + 0.3);
            
            oscillator.start(this.audioContext.currentTime + index * 0.15);
            oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.3);
        });
    }

    // 簡易BGM（ループ用）
    createSimpleBGM(type = 'grassland') {
        if (!this.audioContext) return 0;
        
        const melodies = {
            grassland: [
                { note: 'C4', duration: 0.25 },
                { note: 'E4', duration: 0.25 },
                { note: 'G4', duration: 0.25 },
                { note: 'E4', duration: 0.25 },
                { note: 'C4', duration: 0.5 },
                { note: 'G3', duration: 0.5 }
            ],
            cave: [
                { note: 'A3', duration: 0.5 },
                { note: 'C4', duration: 0.5 },
                { note: 'E4', duration: 0.5 },
                { note: 'A3', duration: 0.5 }
            ],
            castle: [
                { note: 'D4', duration: 0.25 },
                { note: 'F4', duration: 0.25 },
                { note: 'A4', duration: 0.25 },
                { note: 'D5', duration: 0.25 },
                { note: 'A4', duration: 0.5 },
                { note: 'F4', duration: 0.5 }
            ]
        };

        const noteFrequencies = {
            'C3': 131, 'D3': 147, 'E3': 165, 'F3': 175, 'G3': 196, 'A3': 220, 'B3': 247,
            'C4': 262, 'D4': 294, 'E4': 330, 'F4': 349, 'G4': 392, 'A4': 440, 'B4': 494,
            'C5': 523, 'D5': 587, 'E5': 659, 'F5': 698, 'G5': 784, 'A5': 880, 'B5': 988
        };

        const melody = melodies[type] || melodies.grassland;
        let time = 0;

        melody.forEach(({ note, duration }) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(noteFrequencies[note], this.audioContext.currentTime + time);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + time + duration);
            
            oscillator.start(this.audioContext.currentTime + time);
            oscillator.stop(this.audioContext.currentTime + time + duration);
            
            time += duration;
        });

        return time; // メロディの長さを返す
    }
}