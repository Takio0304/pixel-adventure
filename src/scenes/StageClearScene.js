import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';

export default class StageClearScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageClearScene' });
    }
    
    init(data) {
        this.stageData = data || {};
        this.score = this.stageData.score || 0;
        this.timeBonus = this.stageData.timeBonus || 0;
        this.stageName = this.stageData.stageName || 'ステージ';
    }
    
    create() {
        // 背景（半透明の黒）
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
            .setOrigin(0, 0);
        
        // ステージクリアテキスト
        const clearText = this.add.text(GAME_WIDTH / 2, 150, 'STAGE CLEAR!', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 6
        });
        clearText.setOrigin(0.5);
        
        // アニメーション
        this.tweens.add({
            targets: clearText,
            scale: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // ステージ名
        const stageText = this.add.text(GAME_WIDTH / 2, 220, this.stageName, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        stageText.setOrigin(0.5);
        stageText.setAlpha(0);
        
        // スコア詳細
        const scoreY = 300;
        const scoreItems = [
            { label: 'クリアスコア', value: this.score },
            { label: 'タイムボーナス', value: this.timeBonus },
            { label: '合計スコア', value: this.score + this.timeBonus }
        ];
        
        scoreItems.forEach((item, index) => {
            const y = scoreY + index * 40;
            
            const label = this.add.text(GAME_WIDTH / 2 - 150, y, item.label + ':', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#FFFFFF'
            });
            label.setAlpha(0);
            
            const value = this.add.text(GAME_WIDTH / 2 + 150, y, item.value.toString(), {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#FFFF00'
            });
            value.setOrigin(1, 0);
            value.setAlpha(0);
            
            // 遅延表示
            this.time.delayedCall(500 + index * 200, () => {
                this.tweens.add({
                    targets: [label, value],
                    alpha: 1,
                    duration: 300
                });
                
                // 合計スコアは強調
                if (index === 2) {
                    this.tweens.add({
                        targets: value,
                        scale: 1.2,
                        yoyo: true,
                        duration: 300
                    });
                }
            });
        });
        
        // ステージ名の表示
        this.time.delayedCall(300, () => {
            this.tweens.add({
                targets: stageText,
                alpha: 1,
                duration: 300
            });
        });
        
        // 続行ボタン
        const continueButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, '次へ進む', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        });
        continueButton.setOrigin(0.5);
        continueButton.setInteractive();
        continueButton.setAlpha(0);
        
        // ボタンの表示
        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: continueButton,
                alpha: 1,
                duration: 300
            });
            
            // ボタンの点滅
            this.tweens.add({
                targets: continueButton,
                scale: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        });
        
        // ボタンイベント
        continueButton.on('pointerdown', () => {
            this.scene.start('StageSelectScene');
        });
        
        // スペースキーでも進める
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('StageSelectScene');
        });
        
        // 星のパーティクルエフェクト
        this.createStarParticles();
    }
    
    createStarParticles() {
        // 簡易的な星のエフェクト
        for (let i = 0; i < 20; i++) {
            const star = this.add.text(
                Phaser.Math.Between(50, GAME_WIDTH - 50),
                Phaser.Math.Between(-50, -10),
                '★',
                {
                    fontSize: Phaser.Math.Between(16, 32) + 'px',
                    color: '#FFD700'
                }
            );
            
            this.tweens.add({
                targets: star,
                y: GAME_HEIGHT + 50,
                rotation: Phaser.Math.Between(-6, 6),
                duration: Phaser.Math.Between(2000, 4000),
                delay: Phaser.Math.Between(0, 2000),
                repeat: -1
            });
        }
    }
}