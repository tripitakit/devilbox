import Phaser from 'phaser';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MenuScene from '../scenes/MenuScene.js';
import GameScene from '../scenes/GameScene.js';
import UIScene from '../scenes/UIScene.js';
import PauseScene from '../scenes/PauseScene.js';
import SettingsScene from '../scenes/SettingsScene.js';
import LevelSelectScene from '../scenes/LevelSelectScene.js';
import GameOverScene from '../scenes/GameOverScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    width: 800,
    height: 600
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  input: {
    activePointers: 2
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    UIScene,
    PauseScene,
    SettingsScene,
    LevelSelectScene,
    GameOverScene
  ]
};
