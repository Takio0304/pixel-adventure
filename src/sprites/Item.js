export class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        const textureKey = type === 'coin' ? 'coin_0' : 
                          type === 'mushroom' ? 'powerup_mushroom' :
                          type === 'star' ? 'star_0' : 'fireflower_0';
        
        super(scene, x, y, textureKey);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // アイテムを表示
        this.setDepth(55);
        
        // スプライトを拡大表示（コインは1.5倍、その他は1.3倍）
        if (this.type === 'coin') {
            this.setScale(1.5);
        } else {
            this.setScale(1.3);
        }
        
        this.type = type;
        this.scene = scene;
        this.collected = false;
        
        // アイテムタイプ別の設定
        this.setupByType();
    }
    
    setupByType() {
        switch (this.type) {
            case 'coin':
                this.body.setAllowGravity(false);
                this.body.setSize(10, 10);
                this.body.setOffset(1, 1);
                this.play('coin_spin');
                this.points = 10;
                break;
                
            case 'mushroom':
                this.body.setBounce(0.3);
                this.body.setVelocityX(50);
                this.body.setSize(14, 14);
                this.body.setOffset(1, 1);
                this.points = 1000;
                
                // 出現アニメーション
                this.scene.tweens.add({
                    targets: this,
                    y: this.y - 16,
                    duration: 500,
                    ease: 'Power1'
                });
                break;
                
            case 'star':
                this.body.setBounce(0.8);
                this.body.setVelocityX(80);
                this.body.setVelocityY(-300);
                this.body.setSize(14, 14);
                this.body.setOffset(1, 1);
                this.play('star_twinkle');
                this.points = 1000;
                break;
                
            case 'fireflower':
                this.body.setAllowGravity(false);
                this.body.setSize(12, 14);
                this.body.setOffset(2, 1);
                this.play('fireflower_burn');
                this.points = 1000;
                
                // 出現アニメーション
                this.scene.tweens.add({
                    targets: this,
                    y: this.y - 16,
                    duration: 500,
                    ease: 'Power1'
                });
                break;
        }
    }
    
    update() {
        if (this.collected) return;
        
        // キノコとスターは壁に当たったら向きを変える
        if (this.type === 'mushroom' || this.type === 'star') {
            if (this.body.blocked.left || this.body.blocked.right) {
                this.setVelocityX(-this.body.velocity.x);
            }
        }
        
        // 画面外に落ちたら削除
        if (this.y > this.scene.physics.world.bounds.height) {
            this.destroy();
        }
    }
    
    collect(player) {
        if (this.collected) return;
        
        this.collected = true;
        
        // アイテム効果を適用
        switch (this.type) {
            case 'coin':
                this.scene.addScore(this.points);
                this.scene.addCoin();
                if (this.scene.soundManager) {
                    this.scene.soundManager.playSound('coin');
                }
                break;
                
            case 'mushroom':
                this.scene.addScore(this.points);
                player.powerUp('mushroom');
                if (this.scene.soundManager) {
                    this.scene.soundManager.playSound('powerup');
                }
                break;
                
            case 'star':
                this.scene.addScore(this.points);
                player.powerUp('star');
                if (this.scene.soundManager) {
                    this.scene.soundManager.playSound('powerup');
                }
                break;
                
            case 'fireflower':
                this.scene.addScore(this.points);
                player.powerUp('fire');
                if (this.scene.soundManager) {
                    this.scene.soundManager.playSound('powerup');
                }
                break;
        }
        
        // 収集エフェクト
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 1.5,
            duration: 200,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}

// コインクラス
export class Coin extends Item {
    constructor(scene, x, y) {
        super(scene, x, y, 'coin');
    }
}

// パワーアップキノコクラス
export class Mushroom extends Item {
    constructor(scene, x, y) {
        super(scene, x, y, 'mushroom');
    }
}

// スタークラス
export class Star extends Item {
    constructor(scene, x, y) {
        super(scene, x, y, 'star');
    }
}

// ファイアフラワークラス
export class FireFlower extends Item {
    constructor(scene, x, y) {
        super(scene, x, y, 'fireflower');
    }
}