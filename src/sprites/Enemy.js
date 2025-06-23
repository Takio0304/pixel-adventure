import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, `enemy_${type}_0`);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.type = type;
        this.scene = scene;
        this.isDead = false;
        
        // 物理設定
        this.setBounce(0.1);
        this.setCollideWorldBounds(true);
        
        // タイプ別の初期設定
        this.setupByType();
    }
    
    setupByType() {
        switch (this.type) {
            case 'walk':
                this.speed = 50;
                this.direction = -1; // -1: 左, 1: 右
                this.body.setSize(14, 14);
                this.body.setOffset(1, 2);
                this.play('enemy_walk');
                break;
                
            case 'fly':
                this.speed = 80;
                this.direction = -1;
                this.flyHeight = this.y;
                this.flyAmplitude = 30;
                this.flyTimer = 0;
                this.body.setSize(12, 10);
                this.body.setOffset(2, 1);
                this.body.setAllowGravity(false);
                this.play('enemy_fly');
                break;
                
            case 'ghost':
                this.speed = 60;
                this.body.setSize(12, 14);
                this.body.setOffset(2, 1);
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
        
        // 壁や端に当たったら向きを変える
        if (this.body.blocked.left || this.body.blocked.right) {
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
    constructor(scene, x, y) {
        super(scene, x, y, 'walk');
    }
}

// 飛行型敵
export class FlyingEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'fly');
    }
}

// 追跡型敵
export class ChasingEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'ghost');
    }
}