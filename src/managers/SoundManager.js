import { SoundGenerator } from '../utils/soundGenerator.js';

export class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.soundGenerator = new SoundGenerator();
        this.enabled = true;
        this.bgmEnabled = true;
        this.bgmLoop = null;
        
        // 音量設定
        this.sfxVolume = 0.5;
        this.bgmVolume = 0.3;
        
        // サウンドの初期化（ユーザーインタラクション後）
        this.initialized = false;
        this.initializeOnInteraction();
    }
    
    initializeOnInteraction() {
        const initSound = () => {
            if (!this.initialized && this.soundGenerator.audioContext) {
                // AudioContextの開始
                this.soundGenerator.audioContext.resume();
                this.initialized = true;
                
                // イベントリスナーを削除
                document.removeEventListener('click', initSound);
                document.removeEventListener('keydown', initSound);
            }
        };
        
        document.addEventListener('click', initSound);
        document.addEventListener('keydown', initSound);
    }
    
    // 効果音の再生
    playSound(soundType) {
        if (!this.enabled || !this.initialized) return;
        
        try {
            switch (soundType) {
                case 'jump':
                    this.soundGenerator.createJumpSound();
                    break;
                case 'coin':
                    this.soundGenerator.createCoinSound();
                    break;
                case 'powerup':
                    this.soundGenerator.createPowerUpSound();
                    break;
                case 'stomp':
                    this.soundGenerator.createStompSound();
                    break;
                case 'damage':
                    this.soundGenerator.createDamageSound();
                    break;
                case 'blockhit':
                    this.soundGenerator.createBlockHitSound();
                    break;
                case 'goal':
                    this.soundGenerator.createGoalSound();
                    break;
            }
        } catch (error) {
            console.error('Sound playback error:', error);
        }
    }
    
    // BGMの開始
    startBGM(type = 'grassland') {
        if (!this.bgmEnabled || !this.initialized) return;
        
        this.stopBGM();
        
        const playBGM = () => {
            const duration = this.soundGenerator.createSimpleBGM(type);
            
            // ループ設定
            this.bgmLoop = setTimeout(() => {
                if (this.bgmEnabled) {
                    playBGM();
                }
            }, duration * 1000);
        };
        
        playBGM();
    }
    
    // BGMの停止
    stopBGM() {
        if (this.bgmLoop) {
            clearTimeout(this.bgmLoop);
            this.bgmLoop = null;
        }
    }
    
    // 音量調整
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
    }
    
    // サウンドのON/OFF
    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        if (!this.bgmEnabled) {
            this.stopBGM();
        }
        return this.bgmEnabled;
    }
    
    // クリーンアップ
    destroy() {
        this.stopBGM();
        if (this.soundGenerator && this.soundGenerator.audioContext) {
            this.soundGenerator.audioContext.close();
        }
    }
}