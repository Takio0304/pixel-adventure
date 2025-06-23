export class Fireball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, direction) {
        super(scene, x, y, 'fireball');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 物理設定
        this.setVelocityX(direction === 'right' ? 400 : -400);
        this.setVelocityY(-200); // 少し上に飛ばす
        this.setBounce(0.8, 0.3);
        this.setGravityY(600);
        this.body.setSize(8, 8);
        
        // 火球のアニメーション
        this.play('fireball_spin');
        
        // 寿命（3秒後に消滅）
        scene.time.delayedCall(3000, () => {
            this.destroy();
        });
    }
    
    update() {
        // 画面外に出たら削除
        if (this.x < -50 || this.x > this.scene.cameras.main.width + 50 || 
            this.y > this.scene.cameras.main.height + 50) {
            this.destroy();
        }
    }
    
    hitEnemy() {
        // エフェクトを表示
        const explosion = this.scene.add.sprite(this.x, this.y, 'fireball');
        explosion.setScale(2);
        this.scene.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 3,
            duration: 300,
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // 火球を削除
        this.destroy();
    }
}

// 火球のスプライトを生成
export function createFireballSprite(scene) {
    const graphics = scene.add.graphics();
    
    // 火球本体（オレンジ色）
    graphics.fillStyle(0xFF6600);
    graphics.fillCircle(4, 4, 3);
    
    // 内側の明るい部分
    graphics.fillStyle(0xFFAA00);
    graphics.fillCircle(4, 4, 2);
    
    // 中心の白い部分
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(4, 4, 1);
    
    graphics.generateTexture('fireball', 8, 8);
    graphics.destroy();
    
    // 火球のアニメーション
    scene.anims.create({
        key: 'fireball_spin',
        frames: [{ key: 'fireball' }],
        frameRate: 10,
        repeat: -1
    });
}