import Phaser from 'phaser';
import { COLORS } from '../utils/constants.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  init(data) {
    this.levelId = data.levelId;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dim overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Pause title
    this.add.text(width / 2, 150, 'PAUSED', {
      fontSize: '48px',
      color: COLORS.UI_TEXT,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Buttons
    const buttonY = 280;
    const buttonSpacing = 70;

    this.createButton(width / 2, buttonY, 'RESUME', () => {
      this.resumeGame();
    });

    this.createButton(width / 2, buttonY + buttonSpacing, 'RESTART', () => {
      this.restartLevel();
    });

    this.createButton(width / 2, buttonY + buttonSpacing * 2, 'SETTINGS', () => {
      this.scene.launch('SettingsScene', { returnScene: 'PauseScene' });
    });

    this.createButton(width / 2, buttonY + buttonSpacing * 3, 'MAIN MENU', () => {
      this.goToMenu();
    });

    // ESC to resume
    this.input.keyboard.on('keydown-ESC', () => {
      this.resumeGame();
    });
  }

  createButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 250, 50, 0x333366, 1);
    bg.setStrokeStyle(2, 0x6666aa);

    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: COLORS.UI_TEXT
    }).setOrigin(0.5);

    button.add([bg, label]);

    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => bg.setFillStyle(0x444488));
    bg.on('pointerout', () => bg.setFillStyle(0x333366));
    bg.on('pointerdown', () => bg.setFillStyle(0x222244));
    bg.on('pointerup', callback);

    return button;
  }

  resumeGame() {
    const gameScene = this.scene.get('GameScene');
    gameScene.events.emit('resume');
    this.scene.stop();
  }

  restartLevel() {
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('GameScene', { level: this.levelId });
  }

  goToMenu() {
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }
}
