import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.js';
import { createClouds } from '../utils/cloudGenerator.js';
import { createMarioBackground } from '../utils/marioBackgroundGenerator.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // グラデーション背景
        this.createGradientBackground();
        
        // 背景要素
        createMarioBackground(this, 'GrasslandStage');
        createClouds(this);
        
        // 装飾的なパーティクル
        this.createFloatingParticles();
        
        // タイトルパネル
        const titlePanel = this.add.graphics();
        titlePanel.fillStyle(0x000000, 0.7);
        titlePanel.fillRoundedRect(GAME_WIDTH / 2 - 300, 120, 600, 120, 20);
        titlePanel.lineStyle(4, 0xFFD700);
        titlePanel.strokeRoundedRect(GAME_WIDTH / 2 - 300, 120, 600, 120, 20);
        
        // タイトル
        const titleText = this.add.text(GAME_WIDTH / 2, 180, 'ピクセルアドベンチャー', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 6
        });
        titleText.setOrigin(0.5);
        
        // タイトルのアニメーション
        this.tweens.add({
            targets: titleText,
            scale: { from: 0.8, to: 1 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // メニュー項目
        const menuItems = [
            { text: 'スタート', scene: 'StageSelectScene', color: 0x4CAF50 },
            { text: '設定', scene: 'SettingsScene', color: 0x2196F3 },
            { text: '記録', scene: null, color: 0xFF9800 }
        ];

        let yPos = 320;
        menuItems.forEach((item, index) => {
            // ボタンの背景
            const buttonWidth = 280;
            const buttonHeight = 60;
            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(item.color, 0.8);
            buttonBg.fillRoundedRect(GAME_WIDTH / 2 - buttonWidth / 2, yPos - buttonHeight / 2, buttonWidth, buttonHeight, 15);
            buttonBg.lineStyle(3, 0xFFFFFF);
            buttonBg.strokeRoundedRect(GAME_WIDTH / 2 - buttonWidth / 2, yPos - buttonHeight / 2, buttonWidth, buttonHeight, 15);
            
            // インタラクティブ領域
            const hitArea = this.add.rectangle(GAME_WIDTH / 2, yPos, buttonWidth, buttonHeight, 0x000000, 0);
            hitArea.setInteractive();
            
            // メニューテキスト
            const menuText = this.add.text(GAME_WIDTH / 2, yPos, item.text, {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            });
            menuText.setOrigin(0.5);
            
            // 初期アニメーション
            buttonBg.alpha = 0;
            menuText.alpha = 0;
            this.time.delayedCall(100 * index, () => {
                this.tweens.add({
                    targets: [buttonBg, menuText],
                    alpha: 1,
                    x: { from: GAME_WIDTH / 2 - 100, to: (target) => target.x },
                    duration: 500,
                    ease: 'Power2'
                });
            });

            // ホバー効果
            hitArea.on('pointerover', () => {
                this.tweens.add({
                    targets: [buttonBg, menuText, hitArea],
                    scale: 1.1,
                    duration: 200,
                    ease: 'Power2'
                });
                buttonBg.clear();
                buttonBg.fillStyle(item.color, 1);
                buttonBg.fillRoundedRect(GAME_WIDTH / 2 - buttonWidth / 2 * 1.1, yPos - buttonHeight / 2 * 1.1, buttonWidth * 1.1, buttonHeight * 1.1, 15);
                buttonBg.lineStyle(4, 0xFFD700);
                buttonBg.strokeRoundedRect(GAME_WIDTH / 2 - buttonWidth / 2 * 1.1, yPos - buttonHeight / 2 * 1.1, buttonWidth * 1.1, buttonHeight * 1.1, 15);
            });

            hitArea.on('pointerout', () => {
                this.tweens.add({
                    targets: [buttonBg, menuText, hitArea],
                    scale: 1,
                    duration: 200,
                    ease: 'Power2'
                });
                buttonBg.clear();
                buttonBg.fillStyle(item.color, 0.8);
                buttonBg.fillRoundedRect(GAME_WIDTH / 2 - buttonWidth / 2, yPos - buttonHeight / 2, buttonWidth, buttonHeight, 15);
                buttonBg.lineStyle(3, 0xFFFFFF);
                buttonBg.strokeRoundedRect(GAME_WIDTH / 2 - buttonWidth / 2, yPos - buttonHeight / 2, buttonWidth, buttonHeight, 15);
            });

            // クリック処理
            hitArea.on('pointerdown', () => {
                if (item.scene) {
                    // クリックアニメーション
                    this.tweens.add({
                        targets: [buttonBg, menuText, hitArea],
                        scale: 0.9,
                        duration: 100,
                        yoyo: true,
                        onComplete: () => {
                            this.scene.start(item.scene);
                        }
                    });
                } else {
                    // 未実装の場合の振動エフェクト
                    this.tweens.add({
                        targets: [buttonBg, menuText],
                        x: { from: (target) => target.x - 5, to: (target) => target.x + 5 },
                        duration: 50,
                        repeat: 3,
                        yoyo: true
                    });
                }
            });

            yPos += 80;
        });

        // 操作説明パネル
        const controlsPanel = this.add.graphics();
        controlsPanel.fillStyle(0x000000, 0.5);
        controlsPanel.fillRoundedRect(GAME_WIDTH / 2 - 250, GAME_HEIGHT - 80, 500, 50, 10);
        
        const controlsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 55, 
            '操作: ← → 移動 / スペース ジャンプ / Shift ダッシュ', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        controlsText.setOrigin(0.5);
        
        // バージョン情報
        const versionText = this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'v1.0.0', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            alpha: 0.5
        });
        versionText.setOrigin(1, 1);
    }
    
    createGradientBackground() {
        // グラデーション背景を作成
        const graphics = this.add.graphics();
        const colorTop = Phaser.Display.Color.HexStringToColor(COLORS.sky);
        const colorBottom = Phaser.Display.Color.HexStringToColor('#87CEEB');
        
        for (let i = 0; i < GAME_HEIGHT; i++) {
            const ratio = i / GAME_HEIGHT;
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                colorTop,
                colorBottom,
                100,
                ratio * 100
            );
            graphics.fillStyle(color.color, 1);
            graphics.fillRect(0, i, GAME_WIDTH, 1);
        }
    }
    
    createFloatingParticles() {
        // 浮遊する星のパーティクル
        for (let i = 0; i < 15; i++) {
            const star = this.add.text(
                Phaser.Math.Between(50, GAME_WIDTH - 50),
                Phaser.Math.Between(50, GAME_HEIGHT - 100),
                '✦',
                {
                    fontSize: Phaser.Math.Between(12, 20) + 'px',
                    color: '#FFFF00',
                    alpha: Phaser.Math.FloatBetween(0.3, 0.7)
                }
            );
            
            // ランダムな動き
            this.tweens.add({
                targets: star,
                x: star.x + Phaser.Math.Between(-30, 30),
                y: star.y + Phaser.Math.Between(-30, 30),
                alpha: { from: star.alpha, to: star.alpha * 0.5 },
                duration: Phaser.Math.Between(3000, 5000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // 回転
            this.tweens.add({
                targets: star,
                rotation: Math.PI * 2,
                duration: Phaser.Math.Between(5000, 10000),
                repeat: -1
            });
        }
    }
}