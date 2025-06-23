import Phaser from 'phaser';
import { gameSettings } from '../config/settings.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, initialDirection = -1) {
        super(scene, x, y, `enemy_${type}_0`);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.type = type;
        this.scene = scene;
        this.isDead = false;
        this.initialDirection = initialDirection;
        
        // 物理設定
        this.setBounce(0.1);
        this.setCollideWorldBounds(true);
        
        // タイプ別の初期設定
        this.setupByType();
    }
    
    setupByType() {
        // 難易度による速度調整
        const difficulty = gameSettings.data.difficulty || 'normal';
        const speedMultiplier = {
            easy: 0.8,
            normal: 1.0,
            hard: 1.3
        };
        const multiplier = speedMultiplier[difficulty];
        
        switch (this.type) {
            case 'walk':
                this.speed = 50 * multiplier;
                this.direction = this.initialDirection; // 初期方向を使用
                this.body.setSize(14, 14);
                this.body.setOffset(1, 1);
                this.play('enemy_walk');
                this.setFlipX(this.direction > 0);
                break;
                
            case 'fly':
                this.speed = 80 * multiplier;
                this.direction = this.initialDirection;
                this.flyHeight = this.y;
                this.flyAmplitude = 30;
                this.flyTimer = 0;
                this.body.setSize(12, 10);
                this.body.setOffset(2, 0);
                this.body.setAllowGravity(false);
                this.play('enemy_fly');
                this.setFlipX(this.direction > 0);
                break;
                
            case 'ghost':
                this.speed = 60 * multiplier;
                this.body.setSize(12, 14);
                this.body.setOffset(2, 0);
                this.body.setAllowGravity(false);
                this.play('enemy_ghost');
                break;
        }
    }
    
    update(player) {
        if (this.isDead) return;
        
        switch (this.type) {
            case 'walk':
                this.updateWalking();
                break;
            case 'fly':
                this.updateFlying();
                break;
            case 'ghost':
                this.updateChasing(player);
                break;
        }
    }
    
    updateWalking() {
        // 横移動
        this.setVelocityX(this.speed * this.direction);
        
        // 速度がゼロになった場合（何かにぶつかった）も折り返す
        if (this.body.velocity.x === 0 && this.body.touching.left) {
            this.direction = 1;
            this.setFlipX(true);
        } else if (this.body.velocity.x === 0 && this.body.touching.right) {
            this.direction = -1;
            this.setFlipX(false);
        }
        
        // 壁や端に当たったら向きを変える
        if (this.body.blocked.left || this.body.blocked.right) {
            this.direction *= -1;
            this.setFlipX(this.direction > 0);
        }
        
        // 床の端を検知（レイキャストを使用）
        const checkDistance = 20;
        const rayX = this.x + (this.direction > 0 ? checkDistance : -checkDistance);
        const rayY = this.y + this.height / 2 + 10;
        
        // 床があるかチェック
        let foundFloor = false;
        this.scene.platforms.getChildren().forEach(platform => {
            const bounds = platform.getBounds();
            if (rayX >= bounds.x && rayX <= bounds.x + bounds.width &&
                rayY >= bounds.y && rayY <= bounds.y + bounds.height) {
                foundFloor = true;
            }
        });
        
        // 床がない（穴）場合は折り返す
        if (!foundFloor) {
            this.direction *= -1;
            this.setFlipX(this.direction > 0);
        }
    }
    
    updateFlying() {
        // 横移動
        this.setVelocityX(this.speed * this.direction);
        
        // 上下の波運動
        this.flyTimer += 0.05;
        this.y = this.flyHeight + Math.sin(this.flyTimer) * this.flyAmplitude;
        
        // 壁に当たったら向きを変える
        if (this.body.blocked.left || this.body.blocked.right || 
            this.x < 50 || this.x > this.scene.physics.world.bounds.width - 50) {
            this.direction *= -1;
            this.setFlipX(this.direction > 0);
        }
    }
    
    updateChasing(player) {
        if (!player || player.isDead) return;
        
        // プレイヤーへの方向を計算
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
            // プレイヤーに向かって移動
            this.setVelocityX((dx / distance) * this.speed);
            this.setVelocityY((dy / distance) * this.speed);
            
            // 向きを設定
            this.setFlipX(dx > 0);
        }
    }
    
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.setVelocity(0, -200);
        this.setCollideWorldBounds(false);
        this.body.setAllowGravity(true);
        this.body.enable = false;
        
        // 回転しながら落下
        this.scene.tweens.add({
            targets: this,
            angle: 180,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                this.destroy();
            }
        });
        
        // スコア加算
        this.scene.addScore(100);
        
        // 敵を倒した音
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound('stomp');
        }
    }
    
    stompedByPlayer() {
        // プレイヤーに踏まれた時の処理
        this.die();
        return true; // プレイヤーがバウンドするかどうか
    }
}

// 歩行型敵
export class WalkingEnemy extends Enemy {
    constructor(scene, x, y, initialDirection = -1) {
        super(scene, x, y, 'walk', initialDirection);
    }
}

// 飛行型敵
export class FlyingEnemy extends Enemy {
    constructor(scene, x, y, initialDirection = -1) {
        super(scene, x, y, 'fly', initialDirection);
    }
}

// 追跡型敵
export class ChasingEnemy extends Enemy {
    constructor(scene, x, y, initialDirection = -1) {
        super(scene, x, y, 'ghost', initialDirection);
    }
}