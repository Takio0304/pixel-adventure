// キノコスプライトを生成するユーティリティ

export function createMushroomSprite(scene, x, y, size = 'small') {
    const graphics = scene.add.graphics();
    
    const dimensions = size === 'small' ? { width: 16, height: 16 } : { width: 16, height: 24 };
    const { width, height } = dimensions;
    
    // キノコの傘（赤色ベースに白い斑点）
    const capHeight = height * 0.6;
    graphics.fillStyle(0xFF4444); // 赤色
    graphics.fillEllipse(width / 2, capHeight / 2, width, capHeight);
    
    // 白い斑点
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(width * 0.3, capHeight * 0.3, 2);
    graphics.fillCircle(width * 0.7, capHeight * 0.4, 2);
    graphics.fillCircle(width * 0.5, capHeight * 0.6, 1.5);
    
    // 顔と体（茎部分）
    const stemY = capHeight * 0.8;
    const stemHeight = height - capHeight;
    graphics.fillStyle(0xFFDAB9); // ベージュ
    graphics.fillRect(width * 0.3, stemY, width * 0.4, stemHeight);
    
    // 目
    graphics.fillStyle(0x000000);
    graphics.fillCircle(width * 0.35, capHeight * 0.7, 1);
    graphics.fillCircle(width * 0.65, capHeight * 0.7, 1);
    
    // 靴
    graphics.fillStyle(0x8B4513); // 茶色
    graphics.fillRect(width * 0.2, height - 2, width * 0.3, 2);
    graphics.fillRect(width * 0.5, height - 2, width * 0.3, 2);
    
    // テクスチャとして生成
    graphics.generateTexture(`mushroom_${size}`, width, height);
    graphics.destroy();
    
    return `mushroom_${size}`;
}

export function createAnimatedMushroomSprites(scene) {
    // 通常サイズのアニメーション用スプライト
    const animations = {
        idle: [],
        walk: [],
        jump: [],
        crouch: []
    };
    
    // 待機アニメーション（2フレーム）
    for (let i = 0; i < 2; i++) {
        const graphics = scene.add.graphics();
        
        // 基本の描画
        drawMushroomBase(graphics, 16, 16);
        
        // フレームごとの変化（傘の上下）
        const offsetY = i === 0 ? 0 : -1;
        graphics.y = offsetY;
        
        graphics.generateTexture(`mushroom_idle_${i}`, 16, 16);
        graphics.destroy();
        animations.idle.push(`mushroom_idle_${i}`);
    }
    
    // 歩行アニメーション（4フレーム）
    for (let i = 0; i < 4; i++) {
        const graphics = scene.add.graphics();
        drawMushroomBase(graphics, 16, 16);
        
        // 足の動き
        const legOffset = i % 2 === 0 ? -1 : 1;
        // ここで足の位置を少しずらす処理を追加
        
        graphics.generateTexture(`mushroom_walk_${i}`, 16, 16);
        graphics.destroy();
        animations.walk.push(`mushroom_walk_${i}`);
    }
    
    // ジャンプスプライト
    const jumpGraphics = scene.add.graphics();
    drawMushroomJump(jumpGraphics, 16, 16);
    jumpGraphics.generateTexture('mushroom_jump', 16, 16);
    jumpGraphics.destroy();
    animations.jump.push('mushroom_jump');
    
    // しゃがみスプライト
    const crouchGraphics = scene.add.graphics();
    drawMushroomCrouch(crouchGraphics, 16, 8);
    crouchGraphics.generateTexture('mushroom_crouch', 16, 8);
    crouchGraphics.destroy();
    animations.crouch.push('mushroom_crouch');
    
    return animations;
}

function drawMushroomBase(graphics, width, height) {
    const capHeight = height * 0.6;
    
    // 傘
    graphics.fillStyle(0xFF4444);
    graphics.fillEllipse(width / 2, capHeight / 2, width, capHeight);
    
    // 斑点
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(width * 0.3, capHeight * 0.3, 2);
    graphics.fillCircle(width * 0.7, capHeight * 0.4, 2);
    
    // 体
    const stemY = capHeight * 0.8;
    const stemHeight = height - capHeight;
    graphics.fillStyle(0xFFDAB9);
    graphics.fillRect(width * 0.3, stemY, width * 0.4, stemHeight);
    
    // 目
    graphics.fillStyle(0x000000);
    graphics.fillCircle(width * 0.35, capHeight * 0.7, 1);
    graphics.fillCircle(width * 0.65, capHeight * 0.7, 1);
    
    // 靴
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(width * 0.2, height - 2, width * 0.3, 2);
    graphics.fillRect(width * 0.5, height - 2, width * 0.3, 2);
}

function drawMushroomJump(graphics, width, height) {
    // ジャンプ時は足を縮める
    const capHeight = height * 0.6;
    
    // 傘（少し上向き）
    graphics.fillStyle(0xFF4444);
    graphics.fillEllipse(width / 2, capHeight / 2 - 1, width, capHeight);
    
    // 斑点
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(width * 0.3, capHeight * 0.3 - 1, 2);
    graphics.fillCircle(width * 0.7, capHeight * 0.4 - 1, 2);
    
    // 体（縮めた状態）
    const stemY = capHeight * 0.8;
    const stemHeight = (height - capHeight) * 0.7;
    graphics.fillStyle(0xFFDAB9);
    graphics.fillRect(width * 0.3, stemY, width * 0.4, stemHeight);
    
    // 目（上を見ている）
    graphics.fillStyle(0x000000);
    graphics.fillCircle(width * 0.35, capHeight * 0.65, 1);
    graphics.fillCircle(width * 0.65, capHeight * 0.65, 1);
    
    // 靴（足を曲げている）
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(width * 0.25, height - 4, width * 0.2, 2);
    graphics.fillRect(width * 0.55, height - 4, width * 0.2, 2);
}

function drawMushroomCrouch(graphics, width, height) {
    // しゃがみ時は傘で隠れる
    const capHeight = height * 0.8;
    
    // 大きな傘
    graphics.fillStyle(0xFF4444);
    graphics.fillEllipse(width / 2, capHeight / 2, width * 1.2, capHeight);
    
    // 斑点
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(width * 0.3, capHeight * 0.3, 2);
    graphics.fillCircle(width * 0.7, capHeight * 0.4, 2);
    graphics.fillCircle(width * 0.5, capHeight * 0.6, 1.5);
    
    // 靴だけ見える
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(width * 0.2, height - 1, width * 0.3, 1);
    graphics.fillRect(width * 0.5, height - 1, width * 0.3, 1);
}