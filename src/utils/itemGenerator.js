// アイテムのスプライトを生成するユーティリティ

export function createItemSprites(scene) {
    // コイン
    createCoinSprite(scene);
    
    // パワーアップキノコ
    createMushroomSprite(scene);
    
    // スター
    createStarSprite(scene);
    
    // ファイアフラワー
    createFireFlowerSprite(scene);
}

function createCoinSprite(scene) {
    // コインのアニメーション（4フレーム）
    for (let i = 0; i < 4; i++) {
        const graphics = scene.add.graphics();
        const size = 12;
        
        // コインの厚み（回転アニメーション用）
        const thickness = Math.abs(Math.cos(i * Math.PI / 4)) * size;
        
        if (thickness > 1) {
            // コインの表面
            graphics.fillStyle(0xFFD700); // ゴールド
            graphics.fillEllipse(size / 2, size / 2, thickness, size);
            
            // 縁取り
            graphics.lineStyle(1, 0xFFA500, 1);
            graphics.strokeEllipse(size / 2, size / 2, thickness, size);
            
            // 光沢
            graphics.fillStyle(0xFFFF00, 0.5);
            graphics.fillEllipse(size / 2 - thickness / 4, size / 2 - size / 4, thickness / 3, size / 3);
        }
        
        graphics.generateTexture(`coin_${i}`, size, size);
        graphics.destroy();
    }
    
    scene.anims.create({
        key: 'coin_spin',
        frames: [
            { key: 'coin_0' },
            { key: 'coin_1' },
            { key: 'coin_2' },
            { key: 'coin_3' }
        ],
        frameRate: 8,
        repeat: -1
    });
}

function createMushroomSprite(scene) {
    const graphics = scene.add.graphics();
    const size = 16;
    
    // キノコの傘
    graphics.fillStyle(0xFF0000); // 赤
    graphics.fillEllipse(size / 2, size * 0.4, size * 0.8, size * 0.5);
    
    // 白い斑点
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(size * 0.3, size * 0.35, 2);
    graphics.fillCircle(size * 0.7, size * 0.4, 2);
    graphics.fillCircle(size * 0.5, size * 0.25, 1.5);
    
    // 茎
    graphics.fillStyle(0xF0E68C); // カーキ
    graphics.fillRect(size * 0.35, size * 0.6, size * 0.3, size * 0.35);
    
    // 目
    graphics.fillStyle(0x000000);
    graphics.fillCircle(size * 0.4, size * 0.75, 1);
    graphics.fillCircle(size * 0.6, size * 0.75, 1);
    
    graphics.generateTexture('powerup_mushroom', size, size);
    graphics.destroy();
}

function createStarSprite(scene) {
    // スターのアニメーション（2フレーム、点滅用）
    for (let i = 0; i < 2; i++) {
        const graphics = scene.add.graphics();
        const size = 16;
        const centerX = size / 2;
        const centerY = size / 2;
        
        // 星の色（点滅）
        const color = i === 0 ? 0xFFFF00 : 0xFFD700;
        graphics.fillStyle(color);
        
        // 五芒星を描画
        const outerRadius = size * 0.45;
        const innerRadius = size * 0.2;
        const points = 5;
        
        graphics.beginPath();
        for (let j = 0; j < points * 2; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const angle = (j * Math.PI) / points;
            const x = centerX + Math.cos(angle - Math.PI / 2) * radius;
            const y = centerY + Math.sin(angle - Math.PI / 2) * radius;
            
            if (j === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        graphics.closePath();
        graphics.fill();
        
        // 顔
        graphics.fillStyle(0x000000);
        graphics.fillCircle(centerX - 2, centerY - 1, 0.8);
        graphics.fillCircle(centerX + 2, centerY - 1, 0.8);
        graphics.fillEllipse(centerX, centerY + 2, 3, 1);
        
        graphics.generateTexture(`star_${i}`, size, size);
        graphics.destroy();
    }
    
    scene.anims.create({
        key: 'star_twinkle',
        frames: [
            { key: 'star_0' },
            { key: 'star_1' }
        ],
        frameRate: 4,
        repeat: -1
    });
}

function createFireFlowerSprite(scene) {
    // ファイアフラワーのアニメーション（2フレーム）
    for (let i = 0; i < 2; i++) {
        const graphics = scene.add.graphics();
        const size = 16;
        
        // 茎
        graphics.fillStyle(0x00FF00); // 緑
        graphics.fillRect(size * 0.45, size * 0.6, size * 0.1, size * 0.35);
        
        // 花びら（炎のような形）
        const flameColors = [0xFF0000, 0xFF4500]; // 赤とオレンジ
        const color = flameColors[i];
        graphics.fillStyle(color);
        
        // 花の中心
        const centerX = size / 2;
        const centerY = size * 0.4;
        
        // 炎の形を描画
        for (let j = 0; j < 8; j++) {
            const angle = (j * Math.PI * 2) / 8;
            const petalLength = size * 0.3;
            const x = centerX + Math.cos(angle) * petalLength;
            const y = centerY + Math.sin(angle) * petalLength;
            
            graphics.beginPath();
            graphics.moveTo(centerX, centerY);
            graphics.lineTo(x, y - 2);
            graphics.lineTo(x + 2, y);
            graphics.closePath();
            graphics.fill();
        }
        
        // 中心の円
        graphics.fillStyle(0xFFFF00); // 黄色
        graphics.fillCircle(centerX, centerY, 2);
        
        // 顔
        graphics.fillStyle(0x000000);
        graphics.fillCircle(centerX - 1, centerY, 0.5);
        graphics.fillCircle(centerX + 1, centerY, 0.5);
        
        graphics.generateTexture(`fireflower_${i}`, size, size);
        graphics.destroy();
    }
    
    scene.anims.create({
        key: 'fireflower_burn',
        frames: [
            { key: 'fireflower_0' },
            { key: 'fireflower_1' }
        ],
        frameRate: 4,
        repeat: -1
    });
}