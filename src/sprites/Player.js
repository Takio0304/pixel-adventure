import { PLAYER_CONFIG } from '../config/gameConfig.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'mushroom_idle_0');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 物理設定
        this.setBounce(0.1);
        this.setCollideWorldBounds(true);
        this.body.setSize(12, 14);
        this.body.setOffset(2, 2);
        
        // プレイヤーの状態
        this.state = {
            isJumping: false,
            isDashing: false,
            isCrouching: false,
            canJump: true,
            facing: 'right',
            size: 'small', // small or big
            powerUp: null // null, 'fire', 'star'
        };
        
        this.isDead = false;
        this.invulnerable = false;
        
        // アニメーション設定
        this.createAnimations();
        
        // 入力設定
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // 初期アニメーション
        this.play('idle');
    }
    
    createAnimations() {
        const scene = this.scene;
        
        // 待機アニメーション
        scene.anims.create({
            key: 'idle',
            frames: [
                { key: 'mushroom_idle_0' },
                { key: 'mushroom_idle_1' }
            ],
            frameRate: 2,
            repeat: -1
        });
        
        // 歩行アニメーション
        scene.anims.create({
            key: 'walk',
            frames: [
                { key: 'mushroom_walk_0' },
                { key: 'mushroom_walk_1' },
                { key: 'mushroom_walk_2' },
                { key: 'mushroom_walk_3' }
            ],
            frameRate: 8,
            repeat: -1
        });
        
        // ジャンプアニメーション
        scene.anims.create({
            key: 'jump',
            frames: [{ key: 'mushroom_jump' }],
            frameRate: 1,
            repeat: 0
        });
        
        // しゃがみアニメーション
        scene.anims.create({
            key: 'crouch',
            frames: [{ key: 'mushroom_crouch' }],
            frameRate: 1,
            repeat: 0
        });
    }
    
    update() {
        if (this.isDead || this.scene.isGameOver) return;
        
        const onGround = this.body.touching.down;
        const speed = this.shiftKey.isDown ? PLAYER_CONFIG.dashSpeed : PLAYER_CONFIG.speed;
        
        // 横移動
        if (this.cursors.left.isDown) {
            this.setVelocityX(-speed);
            this.state.facing = 'left';
            this.setFlipX(true);
            
            if (onGround && !this.state.isCrouching) {
                this.play('walk', true);
            }
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(speed);
            this.state.facing = 'right';
            this.setFlipX(false);
            
            if (onGround && !this.state.isCrouching) {
                this.play('walk', true);
            }
        } else {
            this.setVelocityX(0);
            
            if (onGround && !this.state.isCrouching && !this.state.isJumping) {
                this.play('idle', true);
            }
        }
        
        // ジャンプ
        if (onGround) {
            this.state.isJumping = false;
            this.state.canJump = true;
        }
        
        if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.state.canJump && onGround) {
            this.jump();
        }
        
        // しゃがみ
        if (this.cursors.down.isDown && onGround) {
            this.crouch();
        } else if (this.state.isCrouching && !this.cursors.down.isDown) {
            this.standUp();
        }
        
        // ジャンプ中のアニメーション
        if (!onGround && !this.state.isCrouching) {
            this.play('jump', true);
        }
    }
    
    jump() {
        this.setVelocityY(PLAYER_CONFIG.jumpVelocity);
        this.state.isJumping = true;
        this.state.canJump = false;
        this.play('jump');
        
        // ジャンプ音
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound('jump');
        }
    }
    
    crouch() {
        if (!this.state.isCrouching) {
            this.state.isCrouching = true;
            this.body.setSize(12, 8);
            this.body.setOffset(2, 8);
            this.play('crouch');
        }
    }
    
    standUp() {
        this.state.isCrouching = false;
        this.body.setSize(12, 14);
        this.body.setOffset(2, 2);
    }
    
    takeDamage() {
        if (this.state.powerUp === 'star' || this.invulnerable || this.isDead) {
            return; // 無敵状態または既に死亡中
        }
        
        
        // ダメージ音
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound('damage');
        }
        
        if (this.state.size === 'big') {
            this.state.size = 'small';
            this.invulnerable = true; // 無敵時間を設定
            
            // ダメージアニメーション
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                duration: 100,
                repeat: 5,
                yoyo: true,
                onComplete: () => {
                    this.alpha = 1;
                    this.invulnerable = false; // 無敵時間終了
                }
            });
        } else {
            // 無敵状態にして重複ダメージを防ぐ
            this.invulnerable = true;
            
            // ゲームオーバー処理
            if (this.scene.playerDeath) {
                this.scene.playerDeath();
            }
        }
    }
    
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        
        // 物理エンジンを無効化（重力は残す）
        this.body.setCollideWorldBounds(false);
        this.body.checkCollision.none = true;
        
        // 死亡アニメーション
        // まず上にジャンプ
        this.setVelocityY(-400);
        this.setVelocityX(0);
        
        // 回転しながら落下
        this.scene.tweens.add({
            targets: this,
            angle: 720, // 2回転
            duration: 2000,
            ease: 'Linear'
        });
        
        // 色を徐々に暗くする
        this.scene.tweens.add({
            targets: this,
            tint: 0x666666,
            duration: 1000,
            ease: 'Power2'
        });
        
    }
    
    powerUp(type) {
        switch(type) {
            case 'mushroom':
                this.state.size = 'big';
                // TODO: 大きいスプライトに変更
                break;
            case 'fire':
                this.state.powerUp = 'fire';
                // TODO: 色を変更
                break;
            case 'star':
                this.state.powerUp = 'star';
                // 無敵エフェクト
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0.5,
                    duration: 100,
                    repeat: -1,
                    yoyo: true
                });
                break;
        }
    }
}