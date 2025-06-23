import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // 背景色
        this.cameras.main.setBackgroundColor(COLORS.sky);

        // タイトル
        const titleText = this.add.text(GAME_WIDTH / 2, 200, 'ピクセルアドベンチャー', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        });
        titleText.setOrigin(0.5);

        // メニュー項目
        const menuItems = [
            { text: 'スタート', scene: 'StageSelectScene' },
            { text: '設定', scene: 'SettingsScene' },
            { text: '記録', scene: null }
        ];

        let yPos = 350;
        menuItems.forEach((item, index) => {
            const menuText = this.add.text(GAME_WIDTH / 2, yPos, item.text, {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            });
            menuText.setOrigin(0.5);
            menuText.setInteractive();

            // ホバー効果
            menuText.on('pointerover', () => {
                menuText.setScale(1.1);
                menuText.setColor('#ffff00');
            });

            menuText.on('pointerout', () => {
                menuText.setScale(1);
                menuText.setColor('#ffffff');
            });

            // クリック処理
            menuText.on('pointerdown', () => {
                if (item.scene) {
                    this.scene.start(item.scene);
                } else {
                    console.log(`${item.text}機能は実装予定です`);
                }
            });

            yPos += 60;
        });

        // 操作説明
        const controlsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, 
            '操作: ← → 移動 / スペース ジャンプ / Shift ダッシュ', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        controlsText.setOrigin(0.5);
    }
}