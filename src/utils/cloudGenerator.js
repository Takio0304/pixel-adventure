// 雲を生成するユーティリティ

export function createClouds(scene) {
    const { GAME_WIDTH, GAME_HEIGHT } = scene.sys.game.config;
    
    // 雲のテクスチャを作成
    createCloudTextures(scene);
    
    // 雲を配置
    const cloudPositions = [
        { x: 200, y: 100, type: 'small', speed: 0.2 },
        { x: 600, y: 80, type: 'large', speed: 0.15 },
        { x: 1000, y: 120, type: 'small', speed: 0.25 },
        { x: 1400, y: 90, type: 'large', speed: 0.1 },
        { x: 1800, y: 110, type: 'medium', speed: 0.2 },
        { x: 2200, y: 85, type: 'large', speed: 0.15 },
        { x: 2600, y: 100, type: 'small', speed: 0.3 },
        { x: 3000, y: 95, type: 'medium', speed: 0.2 },
        { x: 3400, y: 115, type: 'small', speed: 0.25 },
        { x: 3800, y: 75, type: 'large', speed: 0.1 }
    ];
    
    cloudPositions.forEach((pos, index) => {
        createCloud(scene, pos.x, pos.y, pos.type, pos.speed, index);
    });
}

function createCloudTextures(scene) {
    // すでにテクスチャが存在する場合はスキップ
    if (scene.textures.exists('cloud_small')) return;
    
    // 小さい雲
    const smallCloudCanvas = scene.textures.createCanvas('cloud_small', 48, 24);
    const smallCtx = smallCloudCanvas.context;
    drawPixelCloud(smallCtx, 48, 24, 'small');
    smallCloudCanvas.refresh();
    
    // 中サイズの雲
    const mediumCloudCanvas = scene.textures.createCanvas('cloud_medium', 64, 32);
    const mediumCtx = mediumCloudCanvas.context;
    drawPixelCloud(mediumCtx, 64, 32, 'medium');
    mediumCloudCanvas.refresh();
    
    // 大きい雲
    const largeCloudCanvas = scene.textures.createCanvas('cloud_large', 80, 36);
    const largeCtx = largeCloudCanvas.context;
    drawPixelCloud(largeCtx, 80, 36, 'large');
    largeCloudCanvas.refresh();
}

function drawPixelCloud(ctx, width, height, size) {
    const pixelSize = 4;
    
    // 雲のピクセルパターンを定義
    let pattern;
    
    if (size === 'small') {
        pattern = [
            '    XXXX    ',
            '  XXXXXXXX  ',
            'XXXXXXXXXXXX',
            'XXXXXXXXXXXX',
            '  XXXXXXXX  ',
            '    XXXX    '
        ];
    } else if (size === 'medium') {
        pattern = [
            '      XXXX      ',
            '    XXXXXXXX    ',
            '  XXXXXXXXXXXX  ',
            'XXXXXXXXXXXXXXXX',
            'XXXXXXXXXXXXXXXX',
            '  XXXXXXXXXXXX  ',
            '    XXXXXXXX    ',
            '      XXXX      '
        ];
    } else {
        pattern = [
            '        XXXX        ',
            '      XXXXXXXX      ',
            '    XXXXXXXXXXXX    ',
            '  XXXXXXXXXXXXXXXX  ',
            'XXXXXXXXXXXXXXXXXXXX',
            'XXXXXXXXXXXXXXXXXXXX',
            '  XXXXXXXXXXXXXXXX  ',
            '    XXXXXXXXXXXX    ',
            '      XXXXXXXX      '
        ];
    }
    
    // 影を描画
    ctx.fillStyle = '#E0E0E0';
    pattern.forEach((row, rowIndex) => {
        // 影は少し下にずらす
        if (rowIndex >= pattern.length / 2) {
            row.split('').forEach((pixel, colIndex) => {
                if (pixel === 'X') {
                    ctx.fillRect(colIndex * pixelSize, rowIndex * pixelSize, pixelSize, pixelSize);
                }
            });
        }
    });
    
    // メインの雲を描画
    ctx.fillStyle = '#FFFFFF';
    pattern.forEach((row, rowIndex) => {
        row.split('').forEach((pixel, colIndex) => {
            if (pixel === 'X') {
                ctx.fillRect(colIndex * pixelSize, rowIndex * pixelSize, pixelSize, pixelSize);
            }
        });
    });
}

function createCloud(scene, x, y, type, speed, index) {
    const cloud = scene.add.image(x, y, `cloud_${type}`);
    cloud.setScrollFactor(speed); // パララックス効果
    cloud.setDepth(-10); // 背景の最も後ろに配置
    cloud.setAlpha(0.8); // 少し透明にして背景感を出す
    
    // ゆっくりと左右に動かす
    scene.tweens.add({
        targets: cloud,
        x: x + 50,
        duration: 20000 + index * 2000, // 雲ごとに少し速度を変える
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

export { createCloud };