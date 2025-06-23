// ブロックとプラットフォームを生成するユーティリティ

export function createBlockTextures(scene) {
    // レンガブロック（草原ステージ用）
    const brickGraphics = scene.add.graphics();
    brickGraphics.fillStyle(0xB8860B); // ダークゴールデンロッド
    brickGraphics.fillRect(0, 0, 16, 16);
    brickGraphics.lineStyle(1, 0x8B6914, 1);
    brickGraphics.strokeRect(0, 0, 16, 16);
    brickGraphics.strokeRect(0, 8, 8, 8);
    brickGraphics.strokeRect(8, 0, 8, 8);
    brickGraphics.generateTexture('brick_block', 16, 16);
    brickGraphics.destroy();
    
    // ？ブロック
    const questionGraphics = scene.add.graphics();
    questionGraphics.fillStyle(0xFFD700); // ゴールド
    questionGraphics.fillRect(0, 0, 16, 16);
    questionGraphics.lineStyle(1, 0xFFA500, 1);
    questionGraphics.strokeRect(0, 0, 16, 16);
    
    // ？マーク
    questionGraphics.fillStyle(0x000000);
    questionGraphics.fillRect(6, 3, 4, 6);
    questionGraphics.fillRect(5, 9, 2, 2);
    questionGraphics.fillRect(9, 9, 2, 2);
    questionGraphics.fillRect(7, 12, 2, 2);
    
    questionGraphics.generateTexture('question_block', 16, 16);
    questionGraphics.destroy();
    
    // 石ブロック（洞窟ステージ用）
    const stoneGraphics = scene.add.graphics();
    stoneGraphics.fillStyle(0x696969); // ダークグレー
    stoneGraphics.fillRect(0, 0, 16, 16);
    stoneGraphics.lineStyle(1, 0x2F4F4F, 1);
    stoneGraphics.strokeRect(0, 0, 16, 16);
    stoneGraphics.strokeRect(2, 2, 5, 5);
    stoneGraphics.strokeRect(9, 8, 5, 5);
    stoneGraphics.generateTexture('stone_block', 16, 16);
    stoneGraphics.destroy();
    
    // 城ブロック（城ステージ用）
    const castleGraphics = scene.add.graphics();
    castleGraphics.fillStyle(0x8B8B8B); // グレー
    castleGraphics.fillRect(0, 0, 16, 16);
    castleGraphics.lineStyle(1, 0x696969, 1);
    castleGraphics.strokeRect(0, 0, 16, 16);
    castleGraphics.strokeRect(0, 0, 8, 8);
    castleGraphics.strokeRect(8, 8, 8, 8);
    castleGraphics.generateTexture('castle_block', 16, 16);
    castleGraphics.destroy();
    
    // 土管（パイプ）
    createPipeTexture(scene);
}

function createPipeTexture(scene) {
    const pipeWidth = 48;
    const pipeHeight = 64;
    
    const pipeGraphics = scene.add.graphics();
    
    // パイプ本体
    pipeGraphics.fillStyle(0x228B22); // フォレストグリーン
    pipeGraphics.fillRect(4, 16, pipeWidth - 8, pipeHeight - 16);
    
    // パイプの縁
    pipeGraphics.fillStyle(0x006400); // ダークグリーン
    pipeGraphics.fillRect(0, 0, pipeWidth, 16);
    
    // ハイライト
    pipeGraphics.fillStyle(0x32CD32); // ライムグリーン
    pipeGraphics.fillRect(8, 4, 4, 8);
    pipeGraphics.fillRect(8, 20, 4, pipeHeight - 24);
    
    // 影
    pipeGraphics.lineStyle(2, 0x006400, 1);
    pipeGraphics.strokeRect(0, 0, pipeWidth, 16);
    pipeGraphics.strokeRect(4, 16, pipeWidth - 8, pipeHeight - 16);
    
    pipeGraphics.generateTexture('pipe', pipeWidth, pipeHeight);
    pipeGraphics.destroy();
}

export function createPlatform(scene, x, y, width, type = 'brick') {
    const platform = scene.physics.add.staticGroup();
    const blockCount = Math.floor(width / 16);
    
    for (let i = 0; i < blockCount; i++) {
        const block = platform.create(x + i * 16, y, `${type}_block`);
        block.setOrigin(0, 0);
    }
    
    return platform;
}

export function createQuestionBlock(scene, x, y, content = 'coin') {
    const block = scene.physics.add.sprite(x, y, 'question_block');
    block.body.setImmovable(true);
    block.body.moves = false;
    block.body.checkCollision.down = false; // 下からの衝突のみ許可
    block.content = content;
    block.used = false;
    
    // ブロックを叩いたときのアニメーション
    block.hit = function() {
        if (this.used) return;
        
        this.used = true;
        
        // ブロックのバウンスアニメーション
        scene.tweens.add({
            targets: this,
            y: this.y - 8,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                // 使用済みブロックの色を変更
                this.setTint(0x808080);
            }
        });
        
        // ブロックヒット音
        if (scene.soundManager) {
            scene.soundManager.playSound('blockhit');
        }
        
        // アイテムを出現させる
        spawnItem(scene, this.x, this.y - 16, this.content);
    };
    
    return block;
}

function spawnItem(scene, x, y, type) {
    // GameSceneのspawnItemメソッドを呼び出す
    if (scene.spawnItem) {
        scene.spawnItem(x, y, type);
    }
}