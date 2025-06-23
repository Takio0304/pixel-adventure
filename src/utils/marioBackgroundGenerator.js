// スーパーマリオブラザーズ風の背景を生成

export function createMarioBackground(scene, stageType) {
    if (stageType === 'GrasslandStage') {
        createGrasslandMarioBackground(scene);
    } else if (stageType === 'CaveStage') {
        createCaveMarioBackground(scene);
    } else if (stageType === 'CastleStage') {
        createCastleMarioBackground(scene);
    }
}

function createGrasslandMarioBackground(scene) {
    const { GAME_WIDTH, GAME_HEIGHT } = scene.sys.game.config;
    
    // 丘を生成
    createPixelHills(scene);
    
    // 茂みを生成
    createPixelBushes(scene);
}

function createPixelHills(scene) {
    const { GAME_WIDTH, GAME_HEIGHT } = scene.sys.game.config;
    
    // すでにテクスチャが存在する場合はスキップ
    if (scene.textures.exists('hill_small')) return;
    
    // 小さい丘のテクスチャ
    const smallHillCanvas = scene.textures.createCanvas('hill_small', 80, 35);
    const smallCtx = smallHillCanvas.context;
    drawPixelHill(smallCtx, 80, 35, 'small');
    smallHillCanvas.refresh();
    
    // 大きい丘のテクスチャ
    const largeHillCanvas = scene.textures.createCanvas('hill_large', 160, 70);
    const largeCtx = largeHillCanvas.context;
    drawPixelHill(largeCtx, 160, 70, 'large');
    largeHillCanvas.refresh();
    
    // 丘を配置
    const hillPositions = [
        { x: 0, y: GAME_HEIGHT - 32, type: 'small' },
        { x: 400, y: GAME_HEIGHT - 32, type: 'large' },
        { x: 900, y: GAME_HEIGHT - 32, type: 'small' },
        { x: 1300, y: GAME_HEIGHT - 32, type: 'large' },
        { x: 1800, y: GAME_HEIGHT - 32, type: 'small' },
        { x: 2200, y: GAME_HEIGHT - 32, type: 'large' },
        { x: 2700, y: GAME_HEIGHT - 32, type: 'small' },
        { x: 3100, y: GAME_HEIGHT - 32, type: 'large' },
        { x: 3600, y: GAME_HEIGHT - 32, type: 'small' },
        { x: 4000, y: GAME_HEIGHT - 32, type: 'large' }
    ];
    
    hillPositions.forEach((pos, index) => {
        const hill = scene.add.image(pos.x, pos.y, `hill_${pos.type}`);
        hill.setOrigin(0, 1);
        hill.setScrollFactor(0.5); // パララックス効果
        hill.setDepth(-8);
        hill.setAlpha(0.6); // 背景らしく薄く
    });
}

function drawPixelHill(ctx, width, height, size) {
    const pixelSize = 5;
    
    let pattern;
    if (size === 'small') {
        pattern = [
            '        XXXX        ',
            '      XXXXXXXX      ',
            '    XXXXXXXXXXXX    ',
            '  XXXXXXXXXXXXXXXX  ',
            'XXXXXXXXXXXXXXXXXXXX'
        ];
    } else {
        pattern = [
            '                XXXXXXXX                ',
            '            XXXXXXXXXXXXXXXX            ',
            '        XXXXXXXXXXXXXXXXXXXXXXXX        ',
            '    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX    ',
            'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
        ];
    }
    
    // メインの丘（明るい緑）
    ctx.fillStyle = '#5EFC03';
    pattern.forEach((row, rowIndex) => {
        row.split('').forEach((pixel, colIndex) => {
            if (pixel === 'X') {
                const y = rowIndex * (height / pattern.length);
                const x = colIndex * (width / row.length);
                const blockHeight = height / pattern.length;
                const blockWidth = width / row.length;
                ctx.fillRect(x, y, blockWidth, blockHeight);
            }
        });
    });
    
    // 影の部分（濃い緑）
    ctx.fillStyle = '#00A800';
    pattern.forEach((row, rowIndex) => {
        if (rowIndex >= pattern.length / 2) {
            row.split('').forEach((pixel, colIndex) => {
                if (pixel === 'X') {
                    const y = rowIndex * (height / pattern.length);
                    const x = colIndex * (width / row.length);
                    const blockHeight = height / pattern.length;
                    const blockWidth = width / row.length;
                    ctx.fillRect(x, y, blockWidth, blockHeight);
                }
            });
        }
    });
}

function createPixelBushes(scene) {
    const { GAME_WIDTH, GAME_HEIGHT } = scene.sys.game.config;
    
    // すでにテクスチャが存在する場合はスキップ
    if (scene.textures.exists('bush_single')) return;
    
    // 茂みのテクスチャを作成
    createBushTexture(scene, 'single', 32, 16);
    createBushTexture(scene, 'double', 64, 16);
    createBushTexture(scene, 'triple', 96, 16);
    
    // 茂みを配置
    const bushPositions = [
        { x: 150, y: GAME_HEIGHT - 48, type: 'single' },
        { x: 350, y: GAME_HEIGHT - 48, type: 'triple' },
        { x: 650, y: GAME_HEIGHT - 48, type: 'single' },
        { x: 850, y: GAME_HEIGHT - 48, type: 'double' },
        { x: 1150, y: GAME_HEIGHT - 48, type: 'single' },
        { x: 1450, y: GAME_HEIGHT - 48, type: 'triple' },
        { x: 1750, y: GAME_HEIGHT - 48, type: 'double' },
        { x: 2050, y: GAME_HEIGHT - 48, type: 'single' },
        { x: 2350, y: GAME_HEIGHT - 48, type: 'triple' },
        { x: 2650, y: GAME_HEIGHT - 48, type: 'single' },
        { x: 2950, y: GAME_HEIGHT - 48, type: 'double' },
        { x: 3250, y: GAME_HEIGHT - 48, type: 'triple' },
        { x: 3550, y: GAME_HEIGHT - 48, type: 'single' },
        { x: 3850, y: GAME_HEIGHT - 48, type: 'double' },
        { x: 4150, y: GAME_HEIGHT - 48, type: 'single' },
        { x: 4450, y: GAME_HEIGHT - 48, type: 'triple' }
    ];
    
    bushPositions.forEach((pos, index) => {
        const bush = scene.add.image(pos.x, pos.y, `bush_${pos.type}`);
        bush.setOrigin(0, 1);
        bush.setScrollFactor(0.9); // 前景に近い
        bush.setDepth(-5);
        bush.setAlpha(0.5); // 背景らしく薄く
    });
}

function createBushTexture(scene, type, width, height) {
    const canvas = scene.textures.createCanvas(`bush_${type}`, width, height);
    const ctx = canvas.context;
    const pixelSize = 4;
    
    let pattern;
    if (type === 'single') {
        pattern = [
            '  XXXX  ',
            'XXXXXXXX',
            'XXXXXXXX',
            'XXXXXXXX'
        ];
    } else if (type === 'double') {
        pattern = [
            '  XXXX    XXXX  ',
            'XXXXXXXXXXXXXXXX',
            'XXXXXXXXXXXXXXXX',
            'XXXXXXXXXXXXXXXX'
        ];
    } else {
        pattern = [
            '  XXXX    XXXX    XXXX  ',
            'XXXXXXXXXXXXXXXXXXXXXXXX',
            'XXXXXXXXXXXXXXXXXXXXXXXX',
            'XXXXXXXXXXXXXXXXXXXXXXXX'
        ];
    }
    
    // メインの茂み（明るい緑）
    ctx.fillStyle = '#5EFC03';
    pattern.forEach((row, rowIndex) => {
        row.split('').forEach((pixel, colIndex) => {
            if (pixel === 'X') {
                ctx.fillRect(colIndex * pixelSize, rowIndex * pixelSize, pixelSize, pixelSize);
            }
        });
    });
    
    // 影の部分（濃い緑）
    ctx.fillStyle = '#00A800';
    pattern.slice(2).forEach((row, rowIndex) => {
        row.split('').forEach((pixel, colIndex) => {
            if (pixel === 'X') {
                ctx.fillRect(colIndex * pixelSize, (rowIndex + 2) * pixelSize, pixelSize, pixelSize);
            }
        });
    });
    
    canvas.refresh();
}

function createCaveMarioBackground(scene) {
    // 洞窟ステージの背景（今後実装）
    // 暗い背景に岩のテクスチャなど
}

function createCastleMarioBackground(scene) {
    // 城ステージの背景（今後実装）
    // レンガ模様の壁など
}

export { createGrasslandMarioBackground, createCaveMarioBackground, createCastleMarioBackground };