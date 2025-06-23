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
        console.log('GameScene init - stage:', this.currentStage);
    }

    preload() {
        // 仮の画像読み込み（後で実際のアセットに置き換え）
        this.load.image('ground', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        console.log('GameScene create started');
        try {
            // スプライトとテクスチャを生成
            console.log('Creating sprites...');
            createAnimatedMushroomSprites(this);
            createBlockTextures(this);
            createEnemySprites(this);
            createItemSprites(this);
            createGoalSprites(this);
            console.log('Sprites created successfully');
        } catch (error) {
            console.error('Error creating sprites:', error);
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Error loading game assets: ' + error.message, {
                fontSize: '24px',
                fill: '#ff0000'
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
        console.log('Creating player...');
        this.player = new Player(this, 100, GAME_HEIGHT - 150);
        console.log('Player created');

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
        this.lives = 3;
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
        this.livesText = this.add.text(GAME_WIDTH - 16, 16, 'ライフ: 3', {
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

        // プラットフォームの配置
        this.createPlatformAt(300, 500, 5, blockType);
        this.createPlatformAt(500, 400, 4, blockType);
        this.createPlatformAt(700, 450, 3, blockType);
        this.createPlatformAt(900, 350, 6, blockType);

        // ？ブロックの配置
        const qBlock1 = createQuestionBlock(this, 400, 350, 'coin');
        this.questionBlocks.add(qBlock1);
        
        const qBlock2 = createQuestionBlock(this, 600, 300, 'mushroom');
        this.questionBlocks.add(qBlock2);
        
        const qBlock3 = createQuestionBlock(this, 1000, 400, 'coin');
        this.questionBlocks.add(qBlock3);

        // パイプの配置
        if (this.currentStage === 'GrasslandStage') {
            const pipe1 = this.platforms.create(800, GAME_HEIGHT - 94, 'pipe');
            pipe1.setOrigin(0, 0);
            
            const pipe2 = this.platforms.create(1200, GAME_HEIGHT - 94, 'pipe');
            pipe2.setOrigin(0, 0);
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
        // プラットフォーム上のコイン
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

    createPlatformAt(x, y, width, type) {
        for (let i = 0; i < width; i++) {
            const block = this.platforms.create(x + i * 16, y, `${type}_block`);
            block.setOrigin(0, 0);
        }
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
        
        // プレイヤーの死亡アニメーション
        this.player.die();
        
        // ライフが残っている場合は再スタート
        this.time.delayedCall(2000, () => {
            if (this.lives > 0) {
                this.scene.restart();
            } else {
                // ゲームオーバー処理
                this.showGameOver();
            }
        });
    }
    
    showGameOver() {
        // ゲームオーバー表示（簡易版）
        const gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'GAME OVER', {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 8
        });
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);
        
        // メニューに戻るボタン
        const backButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'メニューに戻る', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        backButton.setOrigin(0.5);
        backButton.setInteractive();
        backButton.setScrollFactor(0);
        
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
    
    shutdown() {
        // サウンドのクリーンアップ
        if (this.soundManager) {
            this.soundManager.destroy();
        }
    }
}