import Phaser from 'phaser';
import { COLORS } from '../utils/constants.js';
import { audioManager } from '../managers/AudioManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, 100, 'DEVILBOX', {
      fontSize: '64px',
      fontFamily: 'Arial Black, sans-serif',
      color: COLORS.UI_TEXT,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 160, "Maxwell's Demon Game", {
      fontSize: '20px',
      color: COLORS.UI_SECONDARY
    }).setOrigin(0.5);

    // Check if there's saved progress
    const savedProgress = JSON.parse(localStorage.getItem('devilbox_save') || '{}');
    const hasSavedGame = savedProgress.currentLevel > 1 ||
                         Object.keys(savedProgress.levelScores || {}).length > 0;

    // Menu buttons
    const buttonY = 280;
    const buttonSpacing = 70;

    // Start/Continue button
    if (hasSavedGame) {
      this.createButton(width / 2, buttonY, 'CONTINUE', () => {
        audioManager.init();
        audioManager.playClick();
        this.scene.start('GameScene', { level: savedProgress.currentLevel });
      });
      this.createButton(width / 2, buttonY + buttonSpacing, 'NEW GAME', () => {
        audioManager.init();
        audioManager.playClick();
        this.startNewGame();
      });
    } else {
      this.createButton(width / 2, buttonY, 'START GAME', () => {
        audioManager.init();
        audioManager.playClick();
        this.scene.start('GameScene', { level: 1 });
      });
    }

    // Level Select
    this.createButton(width / 2, buttonY + buttonSpacing * (hasSavedGame ? 2 : 1), 'LEVEL SELECT', () => {
      audioManager.init();
      audioManager.playClick();
      this.scene.start('LevelSelectScene');
    });

    // Settings
    this.createButton(width / 2, buttonY + buttonSpacing * (hasSavedGame ? 3 : 2), 'SETTINGS', () => {
      audioManager.init();
      audioManager.playClick();
      this.scene.start('SettingsScene', { returnScene: 'MenuScene' });
    });

    // Instructions at bottom
    const isMobile = this.registry.get('isMobile');
    const instruction = isMobile
      ? 'Hold the button to open the door'
      : 'Hold any key to open the door';
    this.add.text(width / 2, height - 50, instruction, {
      fontSize: '16px',
      color: COLORS.UI_SECONDARY
    }).setOrigin(0.5);
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

    bg.on('pointerover', () => {
      bg.setFillStyle(0x444488);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x333366);
    });

    bg.on('pointerdown', () => {
      bg.setFillStyle(0x222244);
    });

    bg.on('pointerup', () => {
      callback();
    });

    return button;
  }

  startNewGame() {
    // Reset progress
    const defaultProgress = {
      currentLevel: 1,
      unlockedLevels: [1],
      levelScores: {},
      totalPlayTime: 0
    };
    localStorage.setItem('devilbox_save', JSON.stringify(defaultProgress));
    this.scene.start('GameScene', { level: 1 });
  }
}
