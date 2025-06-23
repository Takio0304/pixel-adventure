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
import { Fireball, createFireballSprite } from '../sprites/Fireball.js';
import { gameSettings } from '../config/settings.js';

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
            createFireballSprite(this);
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

        // 物理エンジンの設定（ステージを長くする、下方向に余裕を持たせる）
        this.physics.world.setBounds(0, 0, GAME_WIDTH * 4, GAME_HEIGHT + 200);

        // グループの作成
        this.platforms = this.physics.add.staticGroup();
        this.questionBlocks = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.items = this.physics.add.group();
        this.fireballs = this.physics.add.group();

        // ステージの作成
        this.createStage();

        // プレイヤーの作成
        try {
            this.player = new Player(this, 100, GAME_HEIGHT - 150);
            this.Fireball = Fireball; // Player クラスから参照できるように
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

        // カメラの設定（拡張されたステージに合わせる）
        this.cameras.main.setBounds(0, 0, GAME_WIDTH * 4, GAME_HEIGHT);
        this.cameras.main.startFollow(this.player);

        // UI表示
        this.createUI();
        
        // ゲーム状態の初期化
        this.score = 0;
        this.coins = 0;
        // ライフを引き継ぐか、新規ゲームなら難易度に応じた初期値
        const difficulty = gameSettings.data.difficulty || 'normal';
        const initialLives = {
            easy: 5,
            normal: 3,
            hard: 1
        };
        this.lives = this.remainingLives !== undefined ? this.remainingLives : initialLives[difficulty];
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
        
        // 火球のアップデート
        this.fireballs.children.entries.forEach(fireball => {
            fireball.update();
        });
        
        // 落下チェック（地面より少し下で判定）
        if (this.player.y > GAME_HEIGHT + 50) {
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
        
        // 火球と敵の衝突
        this.physics.add.overlap(this.fireballs, this.enemies, this.handleFireballEnemyCollision, null, this);
        
        // 火球と地形の衝突
        this.physics.add.collider(this.fireballs, this.platforms);
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
    
    handleFireballEnemyCollision(fireball, enemy) {
        // 敵を倒す
        enemy.stompedByPlayer();
        
        // 火球のヒットエフェクト
        fireball.hitEnemy();
        
        // スコア追加
        this.updateScore(200);
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
        
        // 操作説明を最初に表示
        this.showControls();
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

        // 地面の作成（ステージ全体に拡張）
        let previousWasGap = false;
        for (let i = 0; i < GAME_WIDTH * 4; i += 16) {
            // 穴を作る（ステージごとに異なる位置）
            const isGap = this.shouldCreateGap(i);
            
            if (isGap) {
                // 穴の始まりに見えない壁を作る
                if (!previousWasGap) {
                    this.createInvisibleWall(i - 8, GAME_HEIGHT - 22);
                }
                previousWasGap = true;
                continue;
            } else {
                // 穴の終わりに見えない壁を作る
                if (previousWasGap) {
                    this.createInvisibleWall(i + 8, GAME_HEIGHT - 22);
                }
                previousWasGap = false;
            }
            
            const ground = this.platforms.create(i + 8, GAME_HEIGHT - 22, `${blockType}_block`);
            ground.setOrigin(0.5, 0.5);
            
            // 地面の2段目
            const ground2 = this.platforms.create(i + 8, GAME_HEIGHT - 6, `${blockType}_block`);
            ground2.setOrigin(0.5, 0.5);
        }

        // プラットフォームの配置（ステージごとに異なる配置）
        if (this.currentStage === 'GrasslandStage') {
            this.createGrasslandPlatforms(blockType);
        } else if (this.currentStage === 'CaveStage') {
            this.createCavePlatforms(blockType);
        } else if (this.currentStage === 'CastleStage') {
            this.createCastlePlatforms(blockType);
        }

        // ？ブロックの配置（ステージ全体に拡張）
        this.createQuestionBlocks();

        // パイプの配置（ステージ全体に拡張）
        if (this.currentStage === 'GrasslandStage') {
            this.createPipe(800, GAME_HEIGHT - 22);
            this.createPipe(1200, GAME_HEIGHT - 22);
            this.createPipe(2300, GAME_HEIGHT - 22);
            this.createPipe(3000, GAME_HEIGHT - 22);
            this.createPipe(3700, GAME_HEIGHT - 22);
            this.createPipe(4400, GAME_HEIGHT - 22);
        }
        
        // 敵の配置
        this.spawnEnemies();
        
        // コインの配置
        this.spawnCoins();
        
        // ゴールの配置
        this.createGoal();
    }
    
    spawnEnemies() {
        const difficulty = gameSettings.data.difficulty || 'normal';
        const enemyMultiplier = {
            easy: 0.7,
            normal: 1.0,
            hard: 1.5
        };
        const multiplier = enemyMultiplier[difficulty];
        
        if (this.currentStage === 'GrasslandStage') {
            // 草原ステージの敵配置（土管の位置: 800, 1200, 2300, 3000, 3700, 4400）
            this.enemies.add(new WalkingEnemy(this, 400, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 700, GAME_HEIGHT - 100, 1)); // 右向き（土管が800にある）
            this.enemies.add(new WalkingEnemy(this, 1100, GAME_HEIGHT - 100, 1)); // 右向き（土管が1200にある）
            this.enemies.add(new WalkingEnemy(this, 1700, GAME_HEIGHT - 100, -1)); // 左向き（穴が1600-1700にある）
            this.enemies.add(new WalkingEnemy(this, 2100, GAME_HEIGHT - 100, 1)); // 右向き（土管が2300にある）
            this.enemies.add(new WalkingEnemy(this, 2500, GAME_HEIGHT - 100, -1)); // 左向き（穴が2400-2500にある）
            this.enemies.add(new WalkingEnemy(this, 2900, GAME_HEIGHT - 100, 1)); // 右向き（土管が3000にある）
            this.enemies.add(new WalkingEnemy(this, 3400, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 3900, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 4300, GAME_HEIGHT - 100, 1)); // 右向き（土管が4400にある）
            
            // プラットフォーム上の敵
            this.enemies.add(new WalkingEnemy(this, 500, 430));
            this.enemies.add(new WalkingEnemy(this, 1800, 430));
            this.enemies.add(new WalkingEnemy(this, 2900, 330));
            this.enemies.add(new WalkingEnemy(this, 4200, 450));
        } else if (this.currentStage === 'CaveStage') {
            // 洞窟ステージの敵配置
            this.enemies.add(new WalkingEnemy(this, 400, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 800, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 1600, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 2300, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 3200, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 4100, GAME_HEIGHT - 100));
            
            // 飛行型敵
            this.enemies.add(new FlyingEnemy(this, 600, 300));
            this.enemies.add(new FlyingEnemy(this, 1000, 250));
            this.enemies.add(new FlyingEnemy(this, 1800, 300));
            this.enemies.add(new FlyingEnemy(this, 2400, 350));
            this.enemies.add(new FlyingEnemy(this, 3000, 250));
            this.enemies.add(new FlyingEnemy(this, 3600, 300));
            this.enemies.add(new FlyingEnemy(this, 4400, 320));
            
            // 追跡型敵
            this.enemies.add(new ChasingEnemy(this, 1400, 300));
            this.enemies.add(new ChasingEnemy(this, 2700, 300));
            this.enemies.add(new ChasingEnemy(this, 3900, 350));
        } else if (this.currentStage === 'CastleStage') {
            // 城ステージの敵配置（最も難しい）
            this.enemies.add(new WalkingEnemy(this, 350, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 650, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 1000, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 1600, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 2200, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 2800, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 3500, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 4000, GAME_HEIGHT - 100));
            this.enemies.add(new WalkingEnemy(this, 4600, GAME_HEIGHT - 100));
            
            // プラットフォーム上の敵
            this.enemies.add(new WalkingEnemy(this, 750, 250));
            this.enemies.add(new WalkingEnemy(this, 1350, 230));
            this.enemies.add(new WalkingEnemy(this, 2750, 270));
            this.enemies.add(new WalkingEnemy(this, 3850, 200));
            
            // 飛行型敵
            this.enemies.add(new FlyingEnemy(this, 500, 280));
            this.enemies.add(new FlyingEnemy(this, 900, 200));
            this.enemies.add(new FlyingEnemy(this, 1500, 250));
            this.enemies.add(new FlyingEnemy(this, 2100, 200));
            this.enemies.add(new FlyingEnemy(this, 2600, 300));
            this.enemies.add(new FlyingEnemy(this, 3300, 280));
            this.enemies.add(new FlyingEnemy(this, 4100, 300));
            
            // 追跡型敵（多め）
            this.enemies.add(new ChasingEnemy(this, 1200, 300));
            this.enemies.add(new ChasingEnemy(this, 2000, 250));
            this.enemies.add(new ChasingEnemy(this, 2900, 200));
            this.enemies.add(new ChasingEnemy(this, 3700, 250));
            this.enemies.add(new ChasingEnemy(this, 4500, 300));
        }
    }
    
    spawnCoins() {
        if (this.currentStage === 'GrasslandStage') {
            // 草原ステージのコイン配置
            this.createCoinLine(320, 520, 5);
            this.createCoinLine(720, 490, 3);
            this.createCoinLine(900, 350, 4);
            this.createCoinLine(150, GAME_HEIGHT - 80, 3);
            this.createCoinLine(1320, 470, 4);
            this.createCoinLine(1640, 320, 3);
            this.createCoinLine(1820, 450, 5);
            this.createCoinLine(2220, 490, 3);
            this.createCoinLine(2620, 420, 6);
            this.createCoinLine(2920, 350, 4);
            this.createCoinLine(3240, 300, 4);
            this.createCoinLine(3520, 450, 5);
            this.createCoinLine(3820, 390, 3);
            this.createCoinLine(4220, 470, 4);
            this.createCoinLine(4520, 420, 6);
            
            // 穴の上のコイン（リスクリワード）
            this.createCoinArc(1650, 250, 3);
            this.createCoinArc(2450, 280, 3);
            this.createCoinArc(3275, 230, 4);
        } else if (this.currentStage === 'CaveStage') {
            // 洞窟ステージのコイン配置
            this.createCoinLine(320, 470, 4);
            this.createCoinLine(620, 370, 3);
            this.createCoinLine(920, 320, 3);
            this.createCoinLine(1220, 420, 4);
            this.createCoinLine(1600, 250, 2);
            this.createCoinLine(1820, 370, 4);
            this.createCoinLine(2120, 300, 3);
            this.createCoinLine(2520, 420, 3);
            this.createCoinLine(2720, 320, 2);
            this.createCoinLine(2920, 250, 2);
            this.createCoinLine(3320, 370, 4);
            this.createCoinLine(3620, 290, 3);
            this.createCoinLine(4120, 420, 5);
            this.createCoinLine(4420, 350, 4);
            
            // 難しい位置のコイン
            this.createCoinArc(1450, 200, 3);
            this.createCoinArc(2300, 180, 4);
            this.createCoinArc(3100, 180, 4);
        } else if (this.currentStage === 'CastleStage') {
            // 城ステージのコイン配置（最も難しい）
            this.createCoinLine(320, 450, 3);
            this.createCoinLine(570, 350, 2);
            this.createCoinLine(770, 270, 2);
            this.createCoinLine(970, 370, 3);
            this.createCoinLine(1220, 320, 2);
            this.createCoinLine(1370, 250, 2);
            this.createCoinLine(1720, 320, 3);
            this.createCoinLine(2020, 250, 2);
            this.createCoinLine(2570, 370, 2);
            this.createCoinLine(2770, 290, 2);
            this.createCoinLine(2970, 220, 2);
            this.createCoinLine(3370, 350, 3);
            this.createCoinLine(3720, 270, 2);
            this.createCoinLine(3870, 220, 2);
            this.createCoinLine(4220, 370, 3);
            this.createCoinLine(4520, 320, 4);
            
            // 超難しい位置のコイン
            this.createCoinArc(1600, 180, 3);
            this.createCoinArc(2400, 150, 3);
            this.createCoinArc(3200, 150, 4);
            this.createCoinArc(4000, 180, 3);
        }
    }
    
    createCoinLine(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.items.add(new Coin(this, x + i * 25, y));
        }
    }
    
    createCoinArc(x, y, count) {
        const arcHeight = 50;
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            const arcX = x + i * 40;
            const arcY = y - Math.sin(t * Math.PI) * arcHeight;
            this.items.add(new Coin(this, arcX, arcY));
        }
    }

    createPlatformAt(x, y, width, type) {
        for (let i = 0; i < width; i++) {
            const block = this.platforms.create(x + i * 16 + 8, y + 8, `${type}_block`);
            block.setOrigin(0.5, 0.5);
        }
    }
    
    createPipe(x, y) {
        // パイプ本体（下部）
        const pipeBottom = this.platforms.create(x, y, 'pipe');
        pipeBottom.setOrigin(0, 1); // 左下を基準点に
        pipeBottom.setDisplaySize(48, 64);
        pipeBottom.refreshBody();
    }
    
    createInvisibleWall(x, y) {
        // 見えない壁を作成（穴に落ちないように）
        const wall = this.add.rectangle(x, y - 25, 1, 100, 0x000000, 0);
        this.physics.add.existing(wall, true);
        wall.body.setSize(1, 100);
        this.platforms.add(wall);
    }
    
    shouldCreateGap(x) {
        // ステージごとに異なる穴の位置
        const gaps = {
            'GrasslandStage': [
                { start: 1600, end: 1700 },
                { start: 2400, end: 2500 },
                { start: 3200, end: 3350 },
                { start: 4400, end: 4500 }
            ],
            'CaveStage': [
                { start: 1400, end: 1550 },
                { start: 2200, end: 2400 },
                { start: 3000, end: 3200 },
                { start: 3800, end: 3950 },
                { start: 4300, end: 4450 }
            ],
            'CastleStage': [
                { start: 1500, end: 1650 },
                { start: 2300, end: 2500 },
                { start: 3100, end: 3300 },
                { start: 3700, end: 3900 },
                { start: 4200, end: 4350 }
            ]
        };
        
        const stageGaps = gaps[this.currentStage] || [];
        return stageGaps.some(gap => x >= gap.start && x < gap.end);
    }
    
    createGrasslandPlatforms(blockType) {
        // 前半部分
        this.createPlatformAt(300, 550, 5, blockType);
        this.createPlatformAt(500, 480, 4, blockType);
        this.createPlatformAt(700, 520, 3, blockType);
        this.createPlatformAt(900, 450, 6, blockType);
        
        // 中盤部分
        this.createPlatformAt(1300, 500, 4, blockType);
        this.createPlatformAt(1500, 400, 3, blockType);
        // 穴の上のプラットフォーム
        this.createPlatformAt(1620, 350, 3, blockType);
        this.createPlatformAt(1800, 480, 5, blockType);
        this.createPlatformAt(2000, 420, 4, blockType);
        this.createPlatformAt(2200, 520, 3, blockType);
        
        // 後半部分
        this.createPlatformAt(2600, 450, 6, blockType);
        this.createPlatformAt(2900, 380, 4, blockType);
        // 穴の上のプラットフォーム
        this.createPlatformAt(3220, 330, 4, blockType);
        this.createPlatformAt(3500, 480, 5, blockType);
        this.createPlatformAt(3800, 420, 3, blockType);
        this.createPlatformAt(4200, 500, 4, blockType);
        this.createPlatformAt(4500, 450, 6, blockType);
    }
    
    createCavePlatforms(blockType) {
        // 洞窟ステージ：より難しい配置
        this.createPlatformAt(300, 500, 4, blockType);
        this.createPlatformAt(600, 400, 3, blockType);
        this.createPlatformAt(900, 350, 3, blockType);
        this.createPlatformAt(1200, 450, 4, blockType);
        
        // 穴の周りの難しいジャンプ
        this.createPlatformAt(1300, 300, 2, blockType);
        this.createPlatformAt(1580, 280, 2, blockType);
        this.createPlatformAt(1800, 400, 4, blockType);
        this.createPlatformAt(2100, 330, 3, blockType);
        
        // 中盤の複雑な配置
        this.createPlatformAt(2500, 450, 3, blockType);
        this.createPlatformAt(2700, 350, 2, blockType);
        this.createPlatformAt(2900, 280, 2, blockType);
        this.createPlatformAt(3300, 400, 4, blockType);
        this.createPlatformAt(3600, 320, 3, blockType);
        
        // 最終部分
        this.createPlatformAt(4100, 450, 5, blockType);
        this.createPlatformAt(4400, 380, 4, blockType);
        this.createPlatformAt(4700, 500, 3, blockType);
    }
    
    createCastlePlatforms(blockType) {
        // 城ステージ：最も難しい配置
        this.createPlatformAt(300, 480, 3, blockType);
        this.createPlatformAt(550, 380, 2, blockType);
        this.createPlatformAt(750, 300, 2, blockType);
        this.createPlatformAt(950, 400, 3, blockType);
        
        // 動く足場のような配置
        this.createPlatformAt(1200, 350, 2, blockType);
        this.createPlatformAt(1350, 280, 2, blockType);
        this.createPlatformAt(1700, 350, 3, blockType);
        this.createPlatformAt(2000, 280, 2, blockType);
        
        // 精密なジャンプが必要な部分
        this.createPlatformAt(2550, 400, 2, blockType);
        this.createPlatformAt(2750, 320, 2, blockType);
        this.createPlatformAt(2950, 250, 2, blockType);
        this.createPlatformAt(3350, 380, 3, blockType);
        
        // 最終チャレンジ
        this.createPlatformAt(3700, 300, 2, blockType);
        this.createPlatformAt(3850, 250, 2, blockType);
        this.createPlatformAt(4200, 400, 3, blockType);
        this.createPlatformAt(4500, 350, 4, blockType);
        this.createPlatformAt(4800, 450, 3, blockType);
    }
    
    createQuestionBlocks() {
        if (this.currentStage === 'GrasslandStage') {
            // 草原ステージの？ブロック
            this.questionBlocks.add(createQuestionBlock(this, 400, 450, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 600, 400, 'mushroom'));
            this.questionBlocks.add(createQuestionBlock(this, 1000, 480, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 1400, 350, 'star'));
            this.questionBlocks.add(createQuestionBlock(this, 1900, 380, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 2300, 450, 'mushroom'));
            this.questionBlocks.add(createQuestionBlock(this, 2800, 330, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 3400, 430, 'fireflower'));
            this.questionBlocks.add(createQuestionBlock(this, 3900, 380, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 4300, 450, 'star'));
        } else if (this.currentStage === 'CaveStage') {
            // 洞窟ステージの？ブロック
            this.questionBlocks.add(createQuestionBlock(this, 400, 450, 'mushroom'));
            this.questionBlocks.add(createQuestionBlock(this, 700, 350, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 1100, 300, 'star'));
            this.questionBlocks.add(createQuestionBlock(this, 1700, 350, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 2200, 280, 'fireflower'));
            this.questionBlocks.add(createQuestionBlock(this, 2800, 230, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 3400, 350, 'mushroom'));
            this.questionBlocks.add(createQuestionBlock(this, 4000, 400, 'star'));
            this.questionBlocks.add(createQuestionBlock(this, 4600, 430, 'coin'));
        } else if (this.currentStage === 'CastleStage') {
            // 城ステージの？ブロック
            this.questionBlocks.add(createQuestionBlock(this, 400, 430, 'mushroom'));
            this.questionBlocks.add(createQuestionBlock(this, 650, 330, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 850, 250, 'fireflower'));
            this.questionBlocks.add(createQuestionBlock(this, 1300, 230, 'star'));
            this.questionBlocks.add(createQuestionBlock(this, 1900, 230, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 2650, 350, 'mushroom'));
            this.questionBlocks.add(createQuestionBlock(this, 3050, 200, 'coin'));
            this.questionBlocks.add(createQuestionBlock(this, 3800, 250, 'star'));
            this.questionBlocks.add(createQuestionBlock(this, 4600, 400, 'fireflower'));
        }
    }

    hitQuestionBlock(player, block) {
        // プレイヤーが下から叩いた場合のみ反応
        if (player.body.velocity.y < 0 && player.y > block.y + 5) {
            block.hit();
        }
        
        // 横や上からの衝突では通常の物理的な衝突として扱う
        return true;
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
        // ステージの終端にゴールを配置（拡張されたステージの終わり）
        const goalX = GAME_WIDTH * 4 - 200;
        const goalY = GAME_HEIGHT - 22;
        
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
    
    showControls() {
        // 操作説明の背景
        const controlsBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 100, 600, 80, 0x000000, 0.7);
        controlsBg.setScrollFactor(0);
        
        // 操作説明テキスト
        const controlsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 120, '操作方法', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        controlsText.setOrigin(0.5);
        controlsText.setScrollFactor(0);
        
        const instructionsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 90, 
            '←→: 移動  ↑/スペース: ジャンプ  ↓: しゃがむ  Shift: ダッシュ  X: 火球(ファイア時)', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        instructionsText.setOrigin(0.5);
        instructionsText.setScrollFactor(0);
        
        // 5秒後にフェードアウト
        this.time.delayedCall(5000, () => {
            this.tweens.add({
                targets: [controlsBg, controlsText, instructionsText],
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    controlsBg.destroy();
                    controlsText.destroy();
                    instructionsText.destroy();
                }
            });
        });
    }

    shutdown() {
        // サウンドのクリーンアップ
        if (this.soundManager) {
            this.soundManager.destroy();
        }
    }
}