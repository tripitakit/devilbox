import Phaser from 'phaser';
import { levels } from '../config/levelConfig.js';
import { COLORS } from '../utils/constants.js';
import { audioManager } from '../managers/AudioManager.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Load progress
    this.progress = JSON.parse(localStorage.getItem('devilbox_save') || '{}');
    this.progress.unlockedLevels = this.progress.unlockedLevels || [1];
    this.progress.levelScores = this.progress.levelScores || {};

    // Title
    this.add.text(width / 2, 50, 'SELECT LEVEL', {
      fontSize: '36px',
      color: COLORS.UI_TEXT,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Create level grid
    this.createLevelGrid(width, height);

    // Back button
    this.createButton(width / 2, height - 50, 'BACK', () => {
      audioManager.playClick();
      this.scene.start('MenuScene');
    });
  }

  createLevelGrid(width, height) {
    const cols = 5;
    const rows = Math.ceil(levels.length / cols);
    const buttonSize = 80;
    const spacing = 20;

    const startX = width / 2 - ((cols - 1) * (buttonSize + spacing)) / 2;
    const startY = 140;

    levels.forEach((level, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = startX + col * (buttonSize + spacing);
      const y = startY + row * (buttonSize + spacing + 20);

      this.createLevelButton(x, y, level, buttonSize);
    });
  }

  createLevelButton(x, y, level, size) {
    const isUnlocked = this.progress.unlockedLevels.includes(level.id);
    const score = this.progress.levelScores[level.id];

    const container = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, size, size, isUnlocked ? 0x333366 : 0x222233);
    bg.setStrokeStyle(2, isUnlocked ? 0x6666aa : 0x444444);

    // Level number
    const levelNum = this.add.text(0, -10, level.id.toString(), {
      fontSize: '32px',
      color: isUnlocked ? COLORS.UI_TEXT : '#666666',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, levelNum]);

    // Stars if completed
    if (score) {
      const stars = this.createStars(0, 25, score.stars);
      container.add(stars);
    }

    // Lock icon if locked
    if (!isUnlocked) {
      const lock = this.add.text(0, 25, '🔒', {
        fontSize: '20px'
      }).setOrigin(0.5);
      container.add(lock);
    }

    // Level name below
    const name = this.add.text(0, size / 2 + 15, level.name, {
      fontSize: '10px',
      color: isUnlocked ? COLORS.UI_SECONDARY : '#444444'
    }).setOrigin(0.5);
    container.add(name);

    // Make interactive if unlocked
    if (isUnlocked) {
      bg.setInteractive({ useHandCursor: true });

      bg.on('pointerover', () => bg.setFillStyle(0x444488));
      bg.on('pointerout', () => bg.setFillStyle(0x333366));
      bg.on('pointerdown', () => bg.setFillStyle(0x222244));
      bg.on('pointerup', () => {
        audioManager.playClick();
        this.scene.start('GameScene', { level: level.id });
      });
    }
  }

  createStars(x, y, count) {
    const container = this.add.container(x, y);
    const starSpacing = 18;
    const startX = -starSpacing;

    for (let i = 0; i < 3; i++) {
      const filled = i < count;
      const star = this.add.text(startX + i * starSpacing, 0, '★', {
        fontSize: '16px',
        color: filled ? '#ffdd00' : '#444444'
      }).setOrigin(0.5);
      container.add(star);
    }

    return container;
  }

  createButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 200, 45, 0x333366, 1);
    bg.setStrokeStyle(2, 0x6666aa);

    const label = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: COLORS.UI_TEXT
    }).setOrigin(0.5);

    button.add([bg, label]);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(0x444488));
    bg.on('pointerout', () => bg.setFillStyle(0x333366));
    bg.on('pointerup', callback);

    return button;
  }
}
