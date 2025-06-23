// 敵キャラクターのスプライトを生成するユーティリティ

export function createEnemySprites(scene) {
    // 歩行型敵（キノコ型の敵）
    createWalkingEnemy(scene);
    
    // 飛行型敵（コウモリ）
    createFlyingEnemy(scene);
    
    // 追跡型敵（ゴースト）
    createChasingEnemy(scene);
}

function createWalkingEnemy(scene) {
    // 歩行敵のアニメーション（2フレーム）
    for (let i = 0; i < 2; i++) {
        const graphics = scene.add.graphics();
        
        // 茶色いキノコ型の敵
        const width = 16;
        const height = 16;
        const capHeight = height * 0.6;
        
        // 傘（茶色）
        graphics.fillStyle(0x8B4513); // サドルブラウン
        graphics.fillEllipse(width / 2, capHeight / 2, width, capHeight);
        
        // 暗い斑点
        graphics.fillStyle(0x654321);
        graphics.fillCircle(width * 0.3, capHeight * 0.4, 1.5);
        graphics.fillCircle(width * 0.7, capHeight * 0.5, 1.5);
        
        // 体
        const stemY = capHeight * 0.8;
        const stemHeight = height - capHeight;
        graphics.fillStyle(0xDEB887); // バーリウッド
        graphics.fillRect(width * 0.35, stemY, width * 0.3, stemHeight);
        
        // 怒った目
        graphics.fillStyle(0xFF0000);
        graphics.fillRect(width * 0.3, capHeight * 0.6, 2, 1);
        graphics.fillRect(width * 0.65, capHeight * 0.6, 2, 1);
        
        // 足（アニメーション）
        const footOffset = i === 0 ? 0 : 2;
        graphics.fillStyle(0x654321);
        graphics.fillRect(width * 0.25 - footOffset, height - 2, 3, 2);
        graphics.fillRect(width * 0.65 + footOffset, height - 2, 3, 2);
        
        graphics.generateTexture(`enemy_walk_${i}`, width, height);
        graphics.destroy();
    }
    
    // 歩行アニメーション設定
    scene.anims.create({
        key: 'enemy_walk',
        frames: [
            { key: 'enemy_walk_0' },
            { key: 'enemy_walk_1' }
        ],
        frameRate: 4,
        repeat: -1
    });
}

function createFlyingEnemy(scene) {
    // コウモリのアニメーション（2フレーム）
    for (let i = 0; i < 2; i++) {
        const graphics = scene.add.graphics();
        
        const width = 16;
        const height = 12;
        
        // 体
        graphics.fillStyle(0x4B0082); // インディゴ
        graphics.fillEllipse(width / 2, height / 2, 6, 4);
        
        // 翼（アニメーション）
        const wingSpread = i === 0 ? 6 : 8;
        graphics.fillStyle(0x8B008B); // ダークマゼンタ
        
        // 左翼
        graphics.beginPath();
        graphics.moveTo(width / 2 - 3, height / 2);
        graphics.lineTo(width / 2 - wingSpread, height / 2 - 2);
        graphics.lineTo(width / 2 - wingSpread, height / 2 + 2);
        graphics.closePath();
        graphics.fill();
        
        // 右翼
        graphics.beginPath();
        graphics.moveTo(width / 2 + 3, height / 2);
        graphics.lineTo(width / 2 + wingSpread, height / 2 - 2);
        graphics.lineTo(width / 2 + wingSpread, height / 2 + 2);
        graphics.closePath();
        graphics.fill();
        
        // 目
        graphics.fillStyle(0xFF0000);
        graphics.fillCircle(width / 2 - 2, height / 2 - 1, 0.5);
        graphics.fillCircle(width / 2 + 2, height / 2 - 1, 0.5);
        
        graphics.generateTexture(`enemy_fly_${i}`, width, height);
        graphics.destroy();
    }
    
    scene.anims.create({
        key: 'enemy_fly',
        frames: [
            { key: 'enemy_fly_0' },
            { key: 'enemy_fly_1' }
        ],
        frameRate: 8,
        repeat: -1
    });
}

function createChasingEnemy(scene) {
    // ゴーストのアニメーション（3フレーム）
    for (let i = 0; i < 3; i++) {
        const graphics = scene.add.graphics();
        
        const width = 16;
        const height = 16;
        
        // ゴーストの体（半透明風）
        graphics.fillStyle(0xFFFFFF, 0.8);
        graphics.fillCircle(width / 2, height / 2 - 2, 6);
        
        // 下部の波状
        const waveOffset = i * 2;
        graphics.beginPath();
        graphics.moveTo(2, height / 2 + 2);
        for (let x = 2; x <= 14; x += 2) {
            const y = height / 2 + 2 + Math.sin((x + waveOffset) * 0.5) * 2;
            graphics.lineTo(x, y);
        }
        graphics.lineTo(14, height - 1);
        graphics.lineTo(2, height - 1);
        graphics.closePath();
        graphics.fill();
        
        // 目と口
        graphics.fillStyle(0x000000);
        graphics.fillCircle(width / 2 - 2, height / 2 - 2, 1);
        graphics.fillCircle(width / 2 + 2, height / 2 - 2, 1);
        graphics.fillEllipse(width / 2, height / 2 + 1, 2, 1);
        
        graphics.generateTexture(`enemy_ghost_${i}`, width, height);
        graphics.destroy();
    }
    
    scene.anims.create({
        key: 'enemy_ghost',
        frames: [
            { key: 'enemy_ghost_0' },
            { key: 'enemy_ghost_1' },
            { key: 'enemy_ghost_2' }
        ],
        frameRate: 6,
        repeat: -1
    });
}