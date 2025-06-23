// 雲を生成するユーティリティ

export function createClouds(scene) {
    const { GAME_WIDTH, GAME_HEIGHT } = scene.sys.game.config;
    
    // 雲のテクスチャを作成
    createCloudTextures(scene);
    
    // 雲を配置（大幅に増量）
    const cloudPositions = [
        // 最初のエリア
        { x: 100, y: 60, type: 'medium', speed: 0.18 },
        { x: 200, y: 100, type: 'small', speed: 0.2 },
        { x: 350, y: 80, type: 'large', speed: 0.12 },
        { x: 500, y: 120, type: 'small', speed: 0.25 },
        { x: 600, y: 70, type: 'large', speed: 0.15 },
        { x: 750, y: 90, type: 'medium', speed: 0.22 },
        { x: 900, y: 110, type: 'small', speed: 0.28 },
        { x: 1000, y: 65, type: 'large', speed: 0.13 },
        { x: 1150, y: 95, type: 'medium', speed: 0.2 },
        { x: 1300, y: 75, type: 'small', speed: 0.26 },
        
        // 中央エリア
        { x: 1400, y: 90, type: 'large', speed: 0.1 },
        { x: 1550, y: 105, type: 'medium', speed: 0.19 },
        { x: 1700, y: 70, type: 'small', speed: 0.24 },
        { x: 1800, y: 110, type: 'medium', speed: 0.2 },
        { x: 1950, y: 85, type: 'large', speed: 0.14 },
        { x: 2100, y: 95, type: 'small', speed: 0.27 },
        { x: 2200, y: 75, type: 'large', speed: 0.15 },
        { x: 2350, y: 100, type: 'medium', speed: 0.21 },
        { x: 2500, y: 80, type: 'small', speed: 0.29 },
        { x: 2600, y: 105, type: 'large', speed: 0.11 },
        
        // 後半エリア
        { x: 2750, y: 90, type: 'medium', speed: 0.23 },
        { x: 2900, y: 70, type: 'small', speed: 0.3 },
        { x: 3000, y: 95, type: 'large', speed: 0.12 },
        { x: 3150, y: 110, type: 'medium', speed: 0.2 },
        { x: 3300, y: 85, type: 'small', speed: 0.25 },
        { x: 3400, y: 100, type: 'large', speed: 0.16 },
        { x: 3550, y: 75, type: 'medium', speed: 0.22 },
        { x: 3700, y: 90, type: 'small', speed: 0.28 },
        { x: 3800, y: 105, type: 'large', speed: 0.1 },
        { x: 3950, y: 80, type: 'medium', speed: 0.24 },
        
        // 最後のエリア
        { x: 4100, y: 95, type: 'small', speed: 0.26 },
        { x: 4200, y: 70, type: 'large', speed: 0.13 },
        { x: 4350, y: 100, type: 'medium', speed: 0.21 },
        { x: 4500, y: 85, type: 'small', speed: 0.27 },
        { x: 4600, y: 110, type: 'large', speed: 0.14 }
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
    
    // 雲によって透明度を変えて深度感を演出
    const alpha = 0.6 + (speed * 0.8); // 速度が遅い（遠い）雲ほど薄く
    cloud.setAlpha(Math.min(alpha, 0.9));
    
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