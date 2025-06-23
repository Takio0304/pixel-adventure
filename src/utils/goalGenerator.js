// ゴールオブジェクトのスプライトを生成するユーティリティ

export function createGoalSprites(scene) {
    // ゴールフラッグ（旗）
    createFlagSprite(scene);
    
    // ゴールゲート（城ステージ用）
    createGateSprite(scene);
}

function createFlagSprite(scene) {
    // 旗のポール
    const poleGraphics = scene.add.graphics();
    poleGraphics.fillStyle(0x8B8680); // グレー
    poleGraphics.fillRect(7, 0, 2, 96);
    
    // ポールの頂点の球
    poleGraphics.fillStyle(0xFFD700); // ゴールド
    poleGraphics.fillCircle(8, 4, 4);
    
    poleGraphics.generateTexture('goal_pole', 16, 96);
    poleGraphics.destroy();
    
    // 旗のアニメーション（2フレーム）
    for (let i = 0; i < 2; i++) {
        const flagGraphics = scene.add.graphics();
        
        // 旗の布
        flagGraphics.fillStyle(0xFF0000); // 赤
        const waveOffset = i * 2;
        
        flagGraphics.beginPath();
        flagGraphics.moveTo(0, 0);
        
        // 波打つ旗の形
        for (let y = 0; y <= 20; y += 2) {
            const x = 24 + Math.sin((y + waveOffset) * 0.3) * 3;
            flagGraphics.lineTo(x, y);
        }
        
        flagGraphics.lineTo(0, 20);
        flagGraphics.closePath();
        flagGraphics.fill();
        
        // 旗の模様（星）
        flagGraphics.fillStyle(0xFFFF00); // 黄色
        drawStar(flagGraphics, 12, 10, 5, 3, 5);
        
        flagGraphics.generateTexture(`goal_flag_${i}`, 30, 24);
        flagGraphics.destroy();
    }
    
    // 旗のアニメーション設定
    scene.anims.create({
        key: 'flag_wave',
        frames: [
            { key: 'goal_flag_0' },
            { key: 'goal_flag_1' }
        ],
        frameRate: 4,
        repeat: -1
    });
}

function createGateSprite(scene) {
    const gateGraphics = scene.add.graphics();
    const width = 64;
    const height = 80;
    
    // ゲートの枠（石造り）
    gateGraphics.fillStyle(0x696969); // ダークグレー
    
    // 左柱
    gateGraphics.fillRect(0, 0, 12, height);
    // 右柱
    gateGraphics.fillRect(width - 12, 0, 12, height);
    // 上部アーチ
    gateGraphics.fillRect(0, 0, width, 20);
    
    // アーチの装飾
    gateGraphics.fillStyle(0x808080); // グレー
    for (let i = 0; i < 3; i++) {
        gateGraphics.fillRect(16 + i * 16, 4, 8, 8);
    }
    
    // ゲートの内部（暗い）
    gateGraphics.fillStyle(0x000000, 0.8);
    gateGraphics.fillRect(12, 20, width - 24, height - 20);
    
    // 光るエフェクト（ゴール感を演出）
    gateGraphics.fillStyle(0xFFD700, 0.3); // 半透明のゴールド
    gateGraphics.fillEllipse(width / 2, height / 2, 20, 30);
    
    gateGraphics.generateTexture('goal_gate', width, height);
    gateGraphics.destroy();
}

// 星を描画するヘルパー関数
function drawStar(graphics, cx, cy, outerRadius, innerRadius, points) {
    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points;
        const x = cx + Math.cos(angle - Math.PI / 2) * radius;
        const y = cy + Math.sin(angle - Math.PI / 2) * radius;
        
        if (i === 0) {
            graphics.moveTo(x, y);
        } else {
            graphics.lineTo(x, y);
        }
    }
    graphics.closePath();
    graphics.fill();
}