import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // グラデーション背景
        this.createGradientBackground();
        
        // 装飾的な背景要素を作成
        this.createBackgroundElements();
        
        // 装飾的なパーティクル
        this.createFloatingParticles();
        
        // タイトルパネル
        const titlePanel = this.add.graphics();
        titlePanel.fillStyle(0x000000, 0.7);
        titlePanel.fillRoundedRect(GAME_WIDTH / 2 - 320, 120, 640, 130, 20);
        titlePanel.lineStyle(4, 0xFFD700);
        titlePanel.strokeRoundedRect(GAME_WIDTH / 2 - 320, 120, 640, 130, 20);
        
        // タイトルパネルの光るエフェクト
        const glowEffect = this.add.graphics();
        glowEffect.lineStyle(2, 0xFFD700, 0.5);
        glowEffect.strokeRoundedRect(GAME_WIDTH / 2 - 322, 118, 644, 134, 20);
        
        this.tweens.add({
            targets: glowEffect,
            alpha: { from: 0.2, to: 0.8 },
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // タイトル
        const titleText = this.add.text(GAME_WIDTH / 2, 180, 'PIXEL ADVENTURE', {
            fontSize: '42px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 5,
                stroke: true,
                fill: true
            }
        });
        titleText.setOrigin(0.5);
        
        // サブタイトル
        const subtitleText = this.add.text(GAME_WIDTH / 2, 220, 'A RETRO PLATFORM GAME', {
            fontSize: '14px',
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: '700',
            color: '#FFFFFF',
            alpha: 0.8
        });
        subtitleText.setOrigin(0.5);
        
        // タイトルのアニメーション
        this.tweens.add({
            targets: titleText,
            scale: { from: 0.9, to: 1.05 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // サブタイトルのアニメーション
        this.tweens.add({
            targets: subtitleText,
            alpha: { from: 0.5, to: 1 },
            duration: 1500,
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
                fontFamily: '"M PLUS Rounded 1c", "Kosugi Maru", sans-serif',
                fontWeight: '900',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5
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
            'CONTROLS: ←→ MOVE / SPACE JUMP / SHIFT DASH', {
            fontSize: '16px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffffff'
        });
        controlsText.setOrigin(0.5);
        
        // バージョン情報
        const versionText = this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'v1.0.0', {
            fontSize: '12px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffffff',
            alpha: 0.5
        });
        versionText.setOrigin(1, 1);
    }
    
    createGradientBackground() {
        // グラデーション背景を作成
        try {
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
        } catch (error) {
            console.error('Gradient background creation failed:', error);
            // フォールバック: 単純な背景色
            this.cameras.main.setBackgroundColor(COLORS.sky);
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
    
    createBackgroundElements() {
        // シンプルな雲を作成
        for (let i = 0; i < 5; i++) {
            const cloudGraphics = this.add.graphics();
            const cloudX = Phaser.Math.Between(100, GAME_WIDTH - 100);
            const cloudY = Phaser.Math.Between(50, 200);
            
            // 雲の形を描画
            cloudGraphics.fillStyle(0xFFFFFF, 0.8);
            cloudGraphics.fillCircle(cloudX, cloudY, 30);
            cloudGraphics.fillCircle(cloudX - 25, cloudY, 25);
            cloudGraphics.fillCircle(cloudX + 25, cloudY, 25);
            cloudGraphics.fillCircle(cloudX, cloudY - 15, 20);
            
            cloudGraphics.setDepth(-10);
            
            // 雲のアニメーション
            this.tweens.add({
                targets: cloudGraphics,
                x: cloudGraphics.x + Phaser.Math.Between(-20, 20),
                duration: Phaser.Math.Between(10000, 20000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // シンプルな丘を作成
        const hillGraphics = this.add.graphics();
        hillGraphics.fillStyle(0x228B22, 0.6);
        
        // 左の丘
        hillGraphics.fillEllipse(150, GAME_HEIGHT - 50, 300, 150);
        // 右の丘
        hillGraphics.fillEllipse(GAME_WIDTH - 150, GAME_HEIGHT - 80, 250, 180);
        
        hillGraphics.setDepth(-5);
    }
}