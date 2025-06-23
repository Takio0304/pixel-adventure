export class Goal extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type = 'flag') {
        super(scene, x, y);
        
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // static body
        
        this.scene = scene;
        this.type = type;
        this.reached = false;
        
        // ゴールのタイプに応じて作成
        if (type === 'flag') {
            this.createFlag();
        } else if (type === 'gate') {
            this.createGate();
        }
    }
    
    createFlag() {
        // ポール
        this.pole = this.scene.add.sprite(0, -48, 'goal_pole');
        this.pole.setOrigin(0.5, 1);
        this.add(this.pole);
        
        // 旗
        this.flag = this.scene.add.sprite(8, -80, 'goal_flag_0');
        this.flag.setOrigin(0, 0.5);
        this.flag.play('flag_wave');
        this.add(this.flag);
        
        // 物理ボディの設定
        this.body.setSize(20, 96);
        this.body.setOffset(-10, -96);
    }
    
    createGate() {
        // ゲート
        this.gate = this.scene.add.sprite(0, -40, 'goal_gate');
        this.gate.setOrigin(0.5, 1);
        this.add(this.gate);
        
        // 物理ボディの設定
        this.body.setSize(64, 80);
        this.body.setOffset(-32, -80);
        
        // 光るエフェクト
        this.scene.tweens.add({
            targets: this.gate,
            alpha: 0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    reachGoal(player) {
        if (this.reached) return;
        
        this.reached = true;
        
        // プレイヤーを無敵にして操作を無効化
        player.body.setVelocity(0, 0);
        player.body.setAllowGravity(false);
        player.body.moves = false;
        
        if (this.type === 'flag') {
            // 旗を下げるアニメーション
            this.scene.tweens.add({
                targets: this.flag,
                y: -20,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    this.celebrateVictory(player);
                }
            });
        } else {
            // ゲートに入るアニメーション
            this.scene.tweens.add({
                targets: player,
                x: this.x,
                y: this.y - 20,
                scaleX: 0.5,
                scaleY: 0.5,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    this.celebrateVictory(player);
                }
            });
        }
    }
    
    celebrateVictory(player) {
        // ゴール音
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound('goal');
            this.scene.soundManager.stopBGM();
        }
        
        // 勝利のアニメーション
        if (this.type === 'flag') {
            // プレイヤーがジャンプして喜ぶ
            player.alpha = 1;
            player.body.moves = true;
            player.body.setAllowGravity(true);
            
            // 自動的に右に歩く
            player.setVelocityX(100);
            
            // 3回ジャンプ
            let jumpCount = 0;
            const jumpTimer = this.scene.time.addEvent({
                delay: 500,
                callback: () => {
                    if (player.body.touching.down) {
                        player.setVelocityY(-400);
                        jumpCount++;
                        
                        if (jumpCount >= 3) {
                            jumpTimer.remove();
                            this.completeStage();
                        }
                    }
                },
                repeat: -1
            });
        } else {
            this.completeStage();
        }
    }
    
    completeStage() {
        // ステージクリア処理
        this.scene.time.delayedCall(1000, () => {
            this.scene.showStageComplete();
        });
    }
}