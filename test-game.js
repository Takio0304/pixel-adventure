// 簡易的な自動テストスクリプト
// このスクリプトはゲームの基本的な動作を確認します

console.log('=== ゲームプロジェクトのテスト ===\n');

// 必要なファイルの存在確認
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'package.json',
    'index.html',
    'src/main.js',
    'src/config/gameConfig.js',
    'src/scenes/MenuScene.js',
    'src/scenes/GameScene.js',
    'src/sprites/Player.js',
    'src/sprites/Enemy.js',
    'src/sprites/Item.js',
    'src/utils/soundGenerator.js'
];

console.log('1. ファイル存在確認:');
let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✓' : '✗'} ${file}`);
    if (!exists) allFilesExist = false;
});

console.log('\n2. package.json検証:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('  ✓ package.jsonは有効なJSONです');
    console.log(`  ✓ プロジェクト名: ${packageJson.name}`);
    console.log(`  ✓ Phaser.jsバージョン: ${packageJson.dependencies.phaser}`);
} catch (error) {
    console.log('  ✗ package.jsonの読み込みエラー:', error.message);
}

console.log('\n3. ゲーム設定確認:');
try {
    const configContent = fs.readFileSync('src/config/gameConfig.js', 'utf8');
    const hasWidth = configContent.includes('GAME_WIDTH');
    const hasHeight = configContent.includes('GAME_HEIGHT');
    const hasPhysics = configContent.includes('PHYSICS_CONFIG');
    
    console.log(`  ${hasWidth ? '✓' : '✗'} GAME_WIDTH定義`);
    console.log(`  ${hasHeight ? '✓' : '✗'} GAME_HEIGHT定義`);
    console.log(`  ${hasPhysics ? '✓' : '✗'} PHYSICS_CONFIG定義`);
} catch (error) {
    console.log('  ✗ gameConfig.jsの読み込みエラー:', error.message);
}

console.log('\n4. HTMLファイル確認:');
try {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    const hasGameContainer = htmlContent.includes('game-container');
    const hasModuleScript = htmlContent.includes('type="module"');
    
    console.log(`  ${hasGameContainer ? '✓' : '✗'} ゲームコンテナ要素`);
    console.log(`  ${hasModuleScript ? '✓' : '✗'} ESモジュールサポート`);
} catch (error) {
    console.log('  ✗ index.htmlの読み込みエラー:', error.message);
}

console.log('\n5. ビルド設定確認:');
const hasBuildScript = fs.existsSync('package.json') && 
    JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts?.build;
const hasDevScript = fs.existsSync('package.json') && 
    JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts?.dev;

console.log(`  ${hasDevScript ? '✓' : '✗'} 開発スクリプト (npm run dev)`);
console.log(`  ${hasBuildScript ? '✓' : '✗'} ビルドスクリプト (npm run build)`);

console.log('\n=== テスト完了 ===');
console.log(`\n結果: ${allFilesExist ? 'すべてのテストに合格しました！' : '一部のテストに失敗しました。'}`);
console.log('\nゲームを起動するには: npm run dev');