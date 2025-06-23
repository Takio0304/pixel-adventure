import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS_CONFIG } from './config/gameConfig.js';
import MenuScene from './scenes/MenuScene.js';
import StageSelectScene from './scenes/StageSelectScene.js';
import GameScene from './scenes/GameScene.js';
import StageClearScene from './scenes/StageClearScene.js';
import SettingsScene from './scenes/SettingsScene.js';

// ゲーム設定
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: PHYSICS_CONFIG
    },
    scene: [MenuScene, StageSelectScene, GameScene, StageClearScene, SettingsScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// ゲームインスタンスの作成
const game = new Phaser.Game(config);

// ローディング完了時の処理
window.addEventListener('load', () => {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
});