import Phaser from 'phaser';
import { getNextLevel } from '../config/levelConfig.js';
import { COLORS } from '../utils/constants.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.won = data.won;
    this.levelId = data.levelId;
    this.time = data.time;
    this.stars = data.stars;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    const title = this.won ? 'LEVEL COMPLETE!' : 'TIME\'S UP!';
    const titleColor = this.won ? '#44ff44' : '#ff4444';

    this.add.text(width / 2, 100, title, {
      fontSize: '42px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Stars (if won)
    if (this.won) {
      this.createStars(width / 2, 180, this.stars);
    }

    // Time display
    this.add.text(width / 2, 250, `Time: ${this.formatTime(this.time)}`, {
      fontSize: '28px',
      color: COLORS.UI_TEXT
    }).setOrigin(0.5);

    // Buttons
    const buttonY = 350;
    const buttonSpacing = 70;

    if (this.won) {
      const nextLevel = getNextLevel(this.levelId);
      if (nextLevel) {
        this.createButton(width / 2, buttonY, 'NEXT LEVEL', () => {
          this.scene.start('GameScene', { level: nextLevel.id });
        });
      }
    }

    this.createButton(width / 2, buttonY + (this.won && getNextLevel(this.levelId) ? buttonSpacing : 0), 'RETRY', () => {
      this.scene.start('GameScene', { level: this.levelId });
    });

    this.createButton(width / 2, buttonY + (this.won && getNextLevel(this.levelId) ? buttonSpacing * 2 : buttonSpacing), 'LEVEL SELECT', () => {
      this.scene.start('LevelSelectScene');
    });

    this.createButton(width / 2, buttonY + (this.won && getNextLevel(this.levelId) ? buttonSpacing * 3 : buttonSpacing * 2), 'MAIN MENU', () => {
      this.scene.start('MenuScene');
    });
  }

  createStars(x, y, count) {
    const container = this.add.container(x, y);
    const starSpacing = 60;
    const startX = -starSpacing;

    for (let i = 0; i < 3; i++) {
      const filled = i < count;
      const star = this.add.text(startX + i * starSpacing, 0, '★', {
        fontSize: '48px',
        color: filled ? '#ffdd00' : '#444444'
      }).setOrigin(0.5);
      container.add(star);

      // Animate stars appearing
      if (filled) {
        star.setScale(0);
        this.tweens.add({
          targets: star,
          scale: 1,
          duration: 300,
          delay: i * 200,
          ease: 'Back.out'
        });
      }
    }

    return container;
  }

  createButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 250, 50, 0x333366, 1);
    bg.setStrokeStyle(2, 0x6666aa);

    const label = this.add.text(0, 0, text, {
      fontSize: '22px',
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

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
