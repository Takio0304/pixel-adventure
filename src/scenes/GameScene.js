import { GAME_WIDTH, GAME_HEIGHT, COLORS, PLAYER_CONFIG } from '../config/gameConfig.js';
import Player from '../sprites/Player.js';
import { createAnimatedMushroomSprites } from '../utils/spriteGenerator.js';
import { createBlockTextures, createPlatform, createQuestionBlock } from '../utils/blockGenerator.js';
import { createEnemySprites } from '../utils/enemyGenerator.js';
import { createItemSprites } from '../utils/itemGenerator.js';
import { createGoalSprites } from '../utils/goalGenerator.js';
import { WalkingEnemy, FlyingEnemy, ChasingEnemy } from '../sprites/Enemy.js';
import { Coin, Mushroom, Star, FireFlower } from '../sprites/Item.js';
import { Goal } from '../sprites/Goal.js';
import { SoundManager } from '../managers/SoundManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.currentStage = data.stage || 'GrasslandStage';
        // シーン再起動時にライフを引き継ぐ
        this.remainingLives = data.lives;
        // シーン再起動時にフラグをリセット
        this.isGameOver = false;
    }

    preload() {
        // 動的にスプライトを生成するため、preloadは不要
    }

    create() {
        try {
            // スプライトとテクスチャを生成
            createAnimatedMushroomSprites(this);
            createBlockTextures(this);
            createEnemySprites(this);
            createItemSprites(this);
            createGoalSprites(this);
        } catch (error) {
            console.error('Error creating sprites:', error);
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Error loading game assets: ' + error.message, {
                fontSize: '24px',
                fill: '#ff0000',
                backgroundColor: '#000000',
                padding: { x: 10, y: 10 }
            }).setOrigin(0.5);
            return;
        }
        
        // ステージに応じた背景色設定
        const bgColors = {
            'GrasslandStage': COLORS.sky,
            'CaveStage': COLORS.cave,
            'CastleStage': COLORS.castle
        };
        this.cameras.main.setBackgroundColor(bgColors[this.currentStage]);

        // 物理エンジンの設定
        this.physics.world.setBounds(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);

        // グループの作成
        this.platforms = this.physics.add.staticGroup();
        this.questionBlocks = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.items = this.physics.add.group();

        // ステージの作成
        this.createStage();

        // プレイヤーの作成
        try {
            this.player = new Player(this, 100, GAME_HEIGHT - 150);
        } catch (error) {
            console.error('Error creating player:', error);
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Error creating player: ' + error.message, {
                fontSize: '24px',
                fill: '#ff0000',
                backgroundColor: '#000000',
                padding: { x: 10, y: 10 }
            }).setOrigin(0.5);
            return;
        }

        // 衝突設定
        this.setupCollisions();

        // カメラの設定
        this.cameras.main.setBounds(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);
        this.cameras.main.startFollow(this.player);

        // UI表示
        this.createUI();
        
        // ゲーム状態の初期化
        this.score = 0;
        this.coins = 0;
        // ライフを引き継ぐか、新規ゲームなら3
        this.lives = this.remainingLives !== undefined ? this.remainingLives : 3;
        this.isGameOver = false;
        this.startTime = this.time.now;
        
        // サウンドマネージャーの初期化
        this.soundManager = new SoundManager(this);
        
        // BGMの開始
        const bgmTypes = {
            'GrasslandStage': 'grassland',
            'CaveStage': 'cave',
            'CastleStage': 'castle'
        };
        this.time.delayedCall(500, () => {
            this.soundManager.startBGM(bgmTypes[this.currentStage]);
        });
        
    }

    update() {
        if (this.isGameOver) return;
        
        // プレイヤーのアップデート
        this.player.update();
        
        // 敵のアップデート
        this.enemies.children.entries.forEach(enemy => {
            enemy.update(this.player);
        });
        
        // アイテムのアップデート
        this.items.children.entries.forEach(item => {
            item.update();
        });
        
        // 落下チェック
        if (this.player.y > GAME_HEIGHT) {
            this.playerDeath();
        }
    }
    
    setupCollisions() {
        // プレイヤーと地形の衝突
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.questionBlocks, this.hitQuestionBlock, null, this);
        
        // 敵と地形の衝突
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.enemies, this.questionBlocks);
        
        // アイテムと地形の衝突
        this.physics.add.collider(this.items, this.platforms);
        
        // プレイヤーと敵の衝突
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        
        // プレイヤーとアイテムの衝突
        this.physics.add.overlap(this.player, this.items, this.handlePlayerItemCollision, null, this);
        
        // プレイヤーとゴールの衝突
        if (this.goal) {
            this.physics.add.overlap(this.player, this.goal, this.handlePlayerGoalCollision, null, this);
        }
    }
    
    handlePlayerEnemyCollision(player, enemy) {
        // 既に死亡中またはゲームオーバーの場合は処理しない
        if (player.isDead || this.isGameOver) return;
        
        // プレイヤーが上から踏んでいるかチェック
        if (player.body.velocity.y > 0 && player.y < enemy.y - enemy.height / 2) {
            // 敵を踏んだ
            enemy.stompedByPlayer();
            player.setVelocityY(-300); // プレイヤーをバウンドさせる
        } else {
            // プレイヤーがダメージを受ける
            player.takeDamage();
        }
    }
    
    handlePlayerItemCollision(player, item) {
        item.collect(player);
    }

    createUI() {
        // スコア表示
        this.scoreText = this.add.text(16, 16, 'スコア: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);
        
        // コイン表示
        this.coinText = this.add.text(16, 50, 'コイン: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.coinText.setScrollFactor(0);

        // ライフ表示
        this.livesText = this.add.text(GAME_WIDTH - 16, 16, `ライフ: ${this.lives}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.livesText.setOrigin(1, 0);
        this.livesText.setScrollFactor(0);
        
        // タイマー表示
        this.timerText = this.add.text(GAME_WIDTH - 16, 50, 'タイム: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.timerText.setOrigin(1, 0);
        this.timerText.setScrollFactor(0);

        // ステージ名表示
        const stageNames = {
            'GrasslandStage': '草原ステージ',
            'CaveStage': '洞窟ステージ',
            'CastleStage': '城ステージ'
        };
        
        this.stageText = this.add.text(GAME_WIDTH / 2, 16, stageNames[this.currentStage], {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.stageText.setOrigin(0.5, 0);
        this.stageText.setScrollFactor(0);
        
        // タイマー更新
        this.time.addEvent({
            delay: 100,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        
        // 洞窟ステージの視界制限
        if (this.currentStage === 'CaveStage') {
            this.createDarknessEffect();
        }
    }
    
    createDarknessEffect() {
        // シンプルな暗闇効果（互換性重視）
        try {
            // 背景を暗くする
            this.cameras.main.setBackgroundColor('#0a0a0a');
            
            // プレイヤーの周りに光を作成
            const lightRadius = 150;
            this.lightCircle = this.add.graphics();
            this.lightCircle.setDepth(99);
            
            // 暗闇のオーバーレイ
            this.darkOverlay = this.add.graphics();
            this.darkOverlay.setDepth(100);
            this.darkOverlay.setScrollFactor(0);
            
            // 更新処理
            this.time.addEvent({
                delay: 33,
                callback: () => {
                    if (this.player && this.darkOverlay) {
                        this.darkOverlay.clear();
                        
                        // 画面全体を暗くする
                        this.darkOverlay.fillStyle(0x000000, 0.8);
                        this.darkOverlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                        
                        // プレイヤーの位置に穴を開ける
                        const playerX = this.player.x - this.cameras.main.scrollX;
                        const playerY = this.player.y - this.cameras.main.scrollY;
                        
                        // グラデーション効果
                        for (let i = lightRadius; i > 0; i -= 5) {
                            const alpha = i / lightRadius;
                            this.darkOverlay.fillStyle(0x000000, alpha * 0.8);
                            this.darkOverlay.fillCircle(playerX, playerY, i);
                        }
                    }
                },
                loop: true
            });
        } catch (error) {
            console.warn('Darkness effect failed:', error);
            // フォールバック: 暗い背景色のみ
            this.cameras.main.setBackgroundColor('#1a1a1a');
        }
    }

    createStage() {
        // ステージごとのブロックタイプ
        const blockTypes = {
            'GrasslandStage': 'brick',
            'CaveStage': 'stone',
            'CastleStage': 'castle'
        };
        const blockType = blockTypes[this.currentStage];

        // 地面の作成
        for (let i = 0; i < GAME_WIDTH * 2; i += 16) {
            const ground = this.platforms.create(i, GAME_HEIGHT - 30, `${blockType}_block`);
            ground.setOrigin(0, 0);
            
            // 地面の2段目
            const ground2 = this.platforms.create(i, GAME_HEIGHT - 14, `${blockType}_block`);
            ground2.setOrigin(0, 0);
        }

        // プラットフォームの配置（ステージごとに異なる高さ）
        if (this.currentStage === 'GrasslandStage') {
            // 草原ステージ：より低い位置に配置（ジャンプで届く高さ）
            this.createPlatformAt(300, 550, 5, blockType);
            this.createPlatformAt(500, 480, 4, blockType);
            this.createPlatformAt(700, 520, 3, blockType);
            this.createPlatformAt(900, 450, 6, blockType);
        } else {
            // 他のステージ：元の高さ
            this.createPlatformAt(300, 500, 5, blockType);
            this.createPlatformAt(500, 400, 4, blockType);
            this.createPlatformAt(700, 450, 3, blockType);
            this.createPlatformAt(900, 350, 6, blockType);
        }

        // ？ブロックの配置（ステージごとに異なる高さ）
        if (this.currentStage === 'GrasslandStage') {
            // 草原ステージ：より低い位置（プレイヤーがジャンプで届く高さ）
            const qBlock1 = createQuestionBlock(this, 400, 450, 'coin');
            this.questionBlocks.add(qBlock1);
            
            const qBlock2 = createQuestionBlock(this, 600, 400, 'mushroom');
            this.questionBlocks.add(qBlock2);
            
            const qBlock3 = createQuestionBlock(this, 1000, 480, 'coin');
            this.questionBlocks.add(qBlock3);
        } else {
            // 他のステージ：元の高さ
            const qBlock1 = createQuestionBlock(this, 400, 350, 'coin');
            this.questionBlocks.add(qBlock1);
            
            const qBlock2 = createQuestionBlock(this, 600, 300, 'mushroom');
            this.questionBlocks.add(qBlock2);
            
            const qBlock3 = createQuestionBlock(this, 1000, 400, 'coin');
            this.questionBlocks.add(qBlock3);
        }

        // パイプの配置
        if (this.currentStage === 'GrasslandStage') {
            this.createPipe(800, GAME_HEIGHT - 30);
            this.createPipe(1200, GAME_HEIGHT - 30);
        }
        
        // 敵の配置
        this.spawnEnemies();
        
        // コインの配置
        this.spawnCoins();
        
        // ゴールの配置
        this.createGoal();
    }
    
    spawnEnemies() {
        // 歩行型敵
        this.enemies.add(new WalkingEnemy(this, 400, GAME_HEIGHT - 100));
        this.enemies.add(new WalkingEnemy(this, 700, GAME_HEIGHT - 100));
        this.enemies.add(new WalkingEnemy(this, 1100, GAME_HEIGHT - 100));
        
        // 飛行型敵
        if (this.currentStage !== 'GrasslandStage') {
            this.enemies.add(new FlyingEnemy(this, 600, 300));
            this.enemies.add(new FlyingEnemy(this, 1000, 250));
        }
        
        // 追跡型敵（洞窟と城のみ）
        if (this.currentStage === 'CaveStage' || this.currentStage === 'CastleStage') {
            this.enemies.add(new ChasingEnemy(this, 1400, 300));
        }
    }
    
    spawnCoins() {
        if (this.currentStage === 'GrasslandStage') {
            // 草原ステージ：より低い位置にコインを配置
            // プラットフォーム上のコイン
            for (let i = 0; i < 5; i++) {
                this.items.add(new Coin(this, 320 + i * 20, 520));
            }
            
            for (let i = 0; i < 3; i++) {
                this.items.add(new Coin(this, 720 + i * 20, 490));
            }
            
            // 空中のコイン（ジャンプで取れる高さ）
            for (let i = 0; i < 4; i++) {
                this.items.add(new Coin(this, 900 + i * 30, 350));
            }
            
            // 地面近くのコイン
            for (let i = 0; i < 3; i++) {
                this.items.add(new Coin(this, 150 + i * 25, GAME_HEIGHT - 80));
            }
        } else {
            // 他のステージ：元の高さ
            for (let i = 0; i < 5; i++) {
                this.items.add(new Coin(this, 320 + i * 20, 470));
            }
            
            for (let i = 0; i < 3; i++) {
                this.items.add(new Coin(this, 720 + i * 20, 420));
            }
            
            // 空中のコイン
            for (let i = 0; i < 4; i++) {
                this.items.add(new Coin(this, 900 + i * 30, 250));
            }
        }
    }

    createPlatformAt(x, y, width, type) {
        for (let i = 0; i < width; i++) {
            const block = this.platforms.create(x + i * 16, y, `${type}_block`);
            block.setOrigin(0, 0);
        }
    }
    
    createPipe(x, y) {
        // パイプ本体（下部）
        const pipeBottom = this.platforms.create(x, y, 'pipe');
        pipeBottom.setOrigin(0, 1); // 左下を基準点に
        pipeBottom.setDisplaySize(48, 64);
        pipeBottom.refreshBody();
    }

    hitQuestionBlock(player, block) {
        // プレイヤーが下から叩いた場合のみ反応
        if (player.body.velocity.y < 0 && player.y > block.y) {
            block.hit();
        }
    }
    
    spawnItem(x, y, type) {
        let item;
        switch(type) {
            case 'coin':
                item = new Coin(this, x, y);
                break;
            case 'mushroom':
                item = new Mushroom(this, x, y);
                break;
            case 'star':
                item = new Star(this, x, y);
                break;
            case 'fireflower':
                item = new FireFlower(this, x, y);
                break;
        }
        
        if (item) {
            this.items.add(item);
        }
    }
    
    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
    }
    
    addCoin() {
        this.coins++;
        if (this.coins >= 100) {
            this.coins = 0;
            this.addLife();
        }
        this.updateCoinDisplay();
    }
    
    addLife() {
        this.lives++;
        this.updateLivesDisplay();
    }
    
    updateScoreDisplay() {
        this.scoreText.setText(`スコア: ${this.score}`);
    }
    
    updateCoinDisplay() {
        this.coinText.setText(`コイン: ${this.coins}`);
    }
    
    updateLivesDisplay() {
        this.livesText.setText(`ライフ: ${this.lives}`);
    }
    
    updateTimer() {
        if (!this.isGameOver && this.startTime) {
            const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
            this.timerText.setText(`タイム: ${elapsed}`);
        }
    }
    
    createGoal() {
        // ステージの終端にゴールを配置
        const goalX = GAME_WIDTH * 2 - 100;
        const goalY = GAME_HEIGHT - 30;
        
        // ステージタイプに応じたゴール
        const goalType = this.currentStage === 'CastleStage' ? 'gate' : 'flag';
        this.goal = new Goal(this, goalX, goalY, goalType);
    }
    
    handlePlayerGoalCollision(player, goal) {
        if (!goal.reached) {
            goal.reachGoal(player);
            this.isGameOver = true;
        }
    }
    
    showStageComplete() {
        // タイムボーナスの計算
        const elapsedTime = Math.floor((this.time.now - this.startTime) / 1000);
        const timeBonus = Math.max(0, 300 - elapsedTime) * 10;
        
        // ステージクリアシーンへ遷移
        const stageNames = {
            'GrasslandStage': '草原ステージ',
            'CaveStage': '洞窟ステージ',
            'CastleStage': '城ステージ'
        };
        
        this.scene.start('StageClearScene', {
            score: this.score,
            timeBonus: timeBonus,
            stageName: stageNames[this.currentStage]
        });
    }
    
    playerDeath() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.lives--;
        
        // ライフ表示を更新
        if (this.livesText) {
            this.livesText.setText(`ライフ: ${this.lives}`);
        }
        
        // プレイヤーの死亡アニメーションを実行
        if (!this.player.isDead) {
            this.player.die();
        }
        
        if (this.lives > 0) {
            // ライフが残っている場合は再スタート
            this.time.addEvent({
                delay: 2500,
                callback: () => {
                    // ライフ数を保持して再スタート
                    this.scene.restart({ stage: this.currentStage, lives: this.lives });
                },
                callbackScope: this
            });
        } else {
            // ライフがない場合はゲームオーバー処理
            this.time.addEvent({
                delay: 2500,
                callback: () => {
                    this.showGameOver();
                },
                callbackScope: this
            });
        }
    }
    
    showGameOver() {
        
        // BGMを停止
        if (this.soundManager) {
            this.soundManager.stopBGM();
        }
        
        // 半透明の黒い背景
        const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
        overlay.setOrigin(0, 0);
        overlay.setScrollFactor(0);
        overlay.setDepth(200);
        
        // ゲームオーバーテキスト
        const gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, 'GAME OVER', {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 8
        });
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);
        gameOverText.setDepth(201);
        
        // スコア表示
        const scoreText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `スコア: ${this.score}`, {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#FFFF00',
            stroke: '#000000',
            strokeThickness: 4
        });
        scoreText.setOrigin(0.5);
        scoreText.setScrollFactor(0);
        scoreText.setDepth(201);
        
        // コイン獲得数表示
        const coinText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `コイン: ${this.coins}`, {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        coinText.setOrigin(0.5);
        coinText.setScrollFactor(0);
        coinText.setDepth(201);
        
        // ボタンの背景
        const buttonBg1 = this.add.rectangle(GAME_WIDTH / 2 - 120, GAME_HEIGHT / 2 + 80, 200, 50, 0x4CAF50);
        buttonBg1.setScrollFactor(0);
        buttonBg1.setDepth(201);
        buttonBg1.setInteractive();
        
        const buttonBg2 = this.add.rectangle(GAME_WIDTH / 2 + 120, GAME_HEIGHT / 2 + 80, 200, 50, 0x2196F3);
        buttonBg2.setScrollFactor(0);
        buttonBg2.setDepth(201);
        buttonBg2.setInteractive();
        
        // 再スタートボタン
        const restartButton = this.add.text(GAME_WIDTH / 2 - 120, GAME_HEIGHT / 2 + 80, 'もう一度', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        restartButton.setOrigin(0.5);
        restartButton.setScrollFactor(0);
        restartButton.setDepth(202);
        
        // メニューに戻るボタン
        const menuButton = this.add.text(GAME_WIDTH / 2 + 120, GAME_HEIGHT / 2 + 80, 'メニューへ', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        menuButton.setOrigin(0.5);
        menuButton.setScrollFactor(0);
        menuButton.setDepth(202);
        
        // ボタンのホバーエフェクト
        buttonBg1.on('pointerover', () => {
            buttonBg1.setFillStyle(0x66BB6A);
            restartButton.setScale(1.1);
        });
        buttonBg1.on('pointerout', () => {
            buttonBg1.setFillStyle(0x4CAF50);
            restartButton.setScale(1);
        });
        buttonBg1.on('pointerdown', () => {
            // ライフとスコアをリセット
            this.lives = 3;
            this.score = 0;
            this.coins = 0;
            this.scene.restart({ stage: this.currentStage });
        });
        
        buttonBg2.on('pointerover', () => {
            buttonBg2.setFillStyle(0x42A5F5);
            menuButton.setScale(1.1);
        });
        buttonBg2.on('pointerout', () => {
            buttonBg2.setFillStyle(0x2196F3);
            menuButton.setScale(1);
        });
        buttonBg2.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        // フェードインアニメーション
        overlay.alpha = 0;
        gameOverText.alpha = 0;
        scoreText.alpha = 0;
        coinText.alpha = 0;
        buttonBg1.alpha = 0;
        buttonBg2.alpha = 0;
        restartButton.alpha = 0;
        menuButton.alpha = 0;
        
        this.tweens.add({
            targets: [overlay],
            alpha: 0.7,
            duration: 500,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: [gameOverText, scoreText, coinText],
            alpha: 1,
            duration: 800,
            delay: 300,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: [buttonBg1, buttonBg2, restartButton, menuButton],
            alpha: 1,
            duration: 600,
            delay: 800,
            ease: 'Power2'
        });
    }
    
    shutdown() {
        // サウンドのクリーンアップ
        if (this.soundManager) {
            this.soundManager.destroy();
        }
    }
}