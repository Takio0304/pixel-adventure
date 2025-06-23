// ゲーム設定ファイル（ローカルストレージ対応）

export class Settings {
    constructor() {
        this.loadSettings();
    }
    
    // デフォルト設定
    getDefaults() {
        return {
            soundEnabled: true,
            bgmEnabled: true,
            sfxVolume: 0.5,
            bgmVolume: 0.3,
            highScores: {
                GrasslandStage: 0,
                CaveStage: 0,
                CastleStage: 0
            },
            stageProgress: {
                GrasslandStage: false,
                CaveStage: false,
                CastleStage: false
            },
            specialCoins: {
                GrasslandStage: [],
                CaveStage: [],
                CastleStage: []
            }
        };
    }
    
    // 設定の読み込み
    loadSettings() {
        try {
            const saved = localStorage.getItem('pixelAdventureSettings');
            if (saved) {
                this.data = { ...this.getDefaults(), ...JSON.parse(saved) };
            } else {
                this.data = this.getDefaults();
            }
        } catch (error) {
            console.error('Settings load error:', error);
            this.data = this.getDefaults();
        }
    }
    
    // 設定の保存
    saveSettings() {
        try {
            localStorage.setItem('pixelAdventureSettings', JSON.stringify(this.data));
        } catch (error) {
            console.error('Settings save error:', error);
        }
    }
    
    // サウンド設定
    setSoundEnabled(enabled) {
        this.data.soundEnabled = enabled;
        this.saveSettings();
    }
    
    setBGMEnabled(enabled) {
        this.data.bgmEnabled = enabled;
        this.saveSettings();
    }
    
    setSFXVolume(volume) {
        this.data.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    setBGMVolume(volume) {
        this.data.bgmVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    // ハイスコアの更新
    updateHighScore(stage, score) {
        if (score > this.data.highScores[stage]) {
            this.data.highScores[stage] = score;
            this.saveSettings();
            return true; // 新記録
        }
        return false;
    }
    
    // ステージクリア状況の更新
    setStageCleared(stage) {
        this.data.stageProgress[stage] = true;
        this.saveSettings();
    }
    
    // 特別なコインの収集
    collectSpecialCoin(stage, coinId) {
        if (!this.data.specialCoins[stage].includes(coinId)) {
            this.data.specialCoins[stage].push(coinId);
            this.saveSettings();
        }
    }
    
    // データのリセット
    resetProgress() {
        this.data.highScores = this.getDefaults().highScores;
        this.data.stageProgress = this.getDefaults().stageProgress;
        this.data.specialCoins = this.getDefaults().specialCoins;
        this.saveSettings();
    }
    
    // 全データのリセット
    resetAll() {
        this.data = this.getDefaults();
        this.saveSettings();
    }
}

// シングルトンインスタンス
export const gameSettings = new Settings();