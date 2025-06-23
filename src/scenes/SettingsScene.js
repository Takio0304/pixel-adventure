import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { gameSettings } from '../config/settings.js';

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }
    
    create() {
        // 背景
        this.cameras.main.setBackgroundColor(0x2C3E50);
        
        // タイトル
        const title = this.add.text(GAME_WIDTH / 2, 80, '設定', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // 設定項目の開始位置
        let yPos = 200;
        const spacing = 80;
        
        // サウンド設定
        this.createToggleOption('効果音', yPos, 
            gameSettings.data.soundEnabled,
            (value) => {
                gameSettings.setSoundEnabled(value);
            }
        );
        
        yPos += spacing;
        
        this.createToggleOption('BGM', yPos,
            gameSettings.data.bgmEnabled,
            (value) => {
                gameSettings.setBGMEnabled(value);
            }
        );
        
        yPos += spacing;
        
        // 音量調整
        this.createVolumeSlider('効果音音量', yPos,
            gameSettings.data.sfxVolume,
            (value) => {
                gameSettings.setSFXVolume(value);
            }
        );
        
        yPos += spacing;
        
        this.createVolumeSlider('BGM音量', yPos,
            gameSettings.data.bgmVolume,
            (value) => {
                gameSettings.setBGMVolume(value);
            }
        );
        
        yPos += spacing;
        
        // 難易度選択
        this.createDifficultySelector('難易度', yPos,
            gameSettings.data.difficulty || 'normal',
            (value) => {
                gameSettings.setDifficulty(value);
            }
        );
        
        yPos += spacing * 1.5;
        
        // データリセットボタン
        const resetButton = this.add.text(GAME_WIDTH / 2, yPos, 'ゲームデータをリセット', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ff6666',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        });
        resetButton.setOrigin(0.5);
        resetButton.setInteractive();
        
        resetButton.on('pointerover', () => {
            resetButton.setScale(1.1);
        });
        
        resetButton.on('pointerout', () => {
            resetButton.setScale(1);
        });
        
        resetButton.on('pointerdown', () => {
            this.confirmReset();
        });
        
        // 戻るボタン
        const backButton = this.add.text(100, GAME_HEIGHT - 50, '← 戻る', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        backButton.setInteractive();
        
        backButton.on('pointerover', () => {
            backButton.setScale(1.1);
        });
        
        backButton.on('pointerout', () => {
            backButton.setScale(1);
        });
        
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
    
    createToggleOption(label, y, currentValue, onChange) {
        // ラベル
        const labelText = this.add.text(300, y, label + ':', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        
        // ON/OFFボタン
        const button = this.add.rectangle(600, y, 100, 40, currentValue ? 0x4CAF50 : 0xf44336);
        button.setInteractive();
        
        const buttonText = this.add.text(600, y, currentValue ? 'ON' : 'OFF', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        buttonText.setOrigin(0.5);
        
        button.on('pointerdown', () => {
            const newValue = !currentValue;
            currentValue = newValue;
            
            button.setFillStyle(newValue ? 0x4CAF50 : 0xf44336);
            buttonText.setText(newValue ? 'ON' : 'OFF');
            
            onChange(newValue);
        });
    }
    
    createVolumeSlider(label, y, currentValue, onChange) {
        // ラベル
        const labelText = this.add.text(300, y, label + ':', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        
        // スライダー背景
        const sliderBg = this.add.rectangle(600, y, 200, 10, 0x666666);
        
        // スライダーハンドル
        const handle = this.add.circle(600 - 100 + currentValue * 200, y, 15, 0xffffff);
        handle.setInteractive();
        this.input.setDraggable(handle);
        
        // 値表示
        const valueText = this.add.text(750, y, Math.round(currentValue * 100) + '%', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        valueText.setOrigin(0, 0.5);
        
        // ドラッグ処理
        handle.on('drag', (pointer, dragX) => {
            const minX = 500;
            const maxX = 700;
            
            handle.x = Phaser.Math.Clamp(dragX, minX, maxX);
            
            const value = (handle.x - minX) / (maxX - minX);
            valueText.setText(Math.round(value * 100) + '%');
            
            onChange(value);
        });
    }
    
    createDifficultySelector(label, y, currentValue, onChange) {
        // ラベル
        const labelText = this.add.text(300, y, label + ':', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        
        const difficulties = [
            { value: 'easy', label: 'やさしい', color: 0x4CAF50 },
            { value: 'normal', label: 'ふつう', color: 0xFFA500 },
            { value: 'hard', label: 'むずかしい', color: 0xf44336 }
        ];
        
        let startX = 500;
        difficulties.forEach((diff, index) => {
            const button = this.add.rectangle(startX + index * 120, y, 100, 40, 
                currentValue === diff.value ? diff.color : 0x666666);
            button.setInteractive();
            
            const buttonText = this.add.text(startX + index * 120, y, diff.label, {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#ffffff'
            });
            buttonText.setOrigin(0.5);
            
            button.on('pointerdown', () => {
                // 全てのボタンの色をリセット
                difficulties.forEach((d, i) => {
                    const btn = this.children.list.find(child => 
                        child.type === 'Rectangle' && 
                        child.x === startX + i * 120 && 
                        child.y === y
                    );
                    if (btn) {
                        btn.setFillStyle(0x666666);
                    }
                });
                
                // 選択されたボタンの色を変更
                button.setFillStyle(diff.color);
                currentValue = diff.value;
                onChange(diff.value);
            });
        });
    }
    
    confirmReset() {
        // 確認ダイアログ
        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 600, 300, 0x000000, 0.8);
        
        const confirmText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 
            '本当にリセットしますか？\n全ての進行状況が失われます', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center'
        });
        confirmText.setOrigin(0.5);
        
        // はいボタン
        const yesButton = this.add.text(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 50, 'はい', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ff6666',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        });
        yesButton.setOrigin(0.5);
        yesButton.setInteractive();
        
        // いいえボタン
        const noButton = this.add.text(GAME_WIDTH / 2 + 100, GAME_HEIGHT / 2 + 50, 'いいえ', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#4CAF50',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        });
        noButton.setOrigin(0.5);
        noButton.setInteractive();
        
        yesButton.on('pointerdown', () => {
            gameSettings.resetAll();
            this.scene.restart();
        });
        
        noButton.on('pointerdown', () => {
            bg.destroy();
            confirmText.destroy();
            yesButton.destroy();
            noButton.destroy();
        });
    }
}