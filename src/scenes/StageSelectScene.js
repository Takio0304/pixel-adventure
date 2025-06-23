import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.js';

export default class StageSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageSelectScene' });
    }

    create() {
        // 背景色
        this.cameras.main.setBackgroundColor(COLORS.sky);

        // タイトル
        const titleText = this.add.text(GAME_WIDTH / 2, 100, 'ステージ選択', {
            fontSize: '40px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        });
        titleText.setOrigin(0.5);

        // ステージボタン
        const stages = [
            { name: '草原ステージ', key: 'GrasslandStage', color: '#00ff00' },
            { name: '洞窟ステージ', key: 'CaveStage', color: '#8b4513' },
            { name: '城ステージ', key: 'CastleStage', color: '#696969' }
        ];

        const buttonWidth = 300;
        const buttonHeight = 150;
        const spacing = 50;
        const startX = (GAME_WIDTH - (buttonWidth * 3 + spacing * 2)) / 2;

        stages.forEach((stage, index) => {
            const x = startX + (buttonWidth + spacing) * index + buttonWidth / 2;
            const y = GAME_HEIGHT / 2;

            // ボタン背景
            const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x333333);
            button.setInteractive();
            button.setStrokeStyle(4, 0xffffff);

            // ステージ名
            const stageText = this.add.text(x, y - 20, stage.name, {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: stage.color,
                stroke: '#000000',
                strokeThickness: 3
            });
            stageText.setOrigin(0.5);

            // ベストスコア（仮）
            const scoreText = this.add.text(x, y + 20, 'ベストスコア: 0', {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff'
            });
            scoreText.setOrigin(0.5);

            // ホバー効果
            button.on('pointerover', () => {
                button.setScale(1.05);
                button.setFillStyle(0x555555);
            });

            button.on('pointerout', () => {
                button.setScale(1);
                button.setFillStyle(0x333333);
            });

            // クリック処理
            button.on('pointerdown', () => {
                console.log(`${stage.name}を開始します`);
                // TODO: 実際のステージシーンに遷移
                this.scene.start('GameScene', { stage: stage.key });
            });
        });

        // 戻るボタン
        const backButton = this.add.text(100, GAME_HEIGHT - 50, '← メニューに戻る', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        backButton.setInteractive();
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}