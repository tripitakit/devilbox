import Phaser from 'phaser';
import { COLORS } from '../utils/constants.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const { width, height } = this.cameras.main;

    // Loading bar background
    const barBg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x333333);

    // Loading bar fill
    const barFill = this.add.rectangle(width / 2 - 198, height / 2, 0, 26, COLORS.BLUE);
    barFill.setOrigin(0, 0.5);

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '24px',
      color: COLORS.UI_TEXT
    }).setOrigin(0.5);

    // Progress text
    const progressText = this.add.text(width / 2, height / 2 + 50, '0%', {
      fontSize: '18px',
      color: COLORS.UI_SECONDARY
    }).setOrigin(0.5);

    // Update loading bar as assets load
    this.load.on('progress', (value) => {
      barFill.width = 396 * value;
      progressText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      loadingText.setText('Complete!');
    });

    // Generate placeholder assets programmatically since we don't have image files yet
    this.createPlaceholderAssets();
  }

  createPlaceholderAssets() {
    // Create red particle texture
    const redParticle = this.make.graphics({ x: 0, y: 0, add: false });
    redParticle.fillStyle(COLORS.RED, 1);
    redParticle.fillCircle(16, 16, 14);
    redParticle.lineStyle(2, 0xffffff, 0.5);
    redParticle.strokeCircle(16, 16, 14);
    redParticle.generateTexture('particle-red', 32, 32);

    // Create blue particle texture
    const blueParticle = this.make.graphics({ x: 0, y: 0, add: false });
    blueParticle.fillStyle(COLORS.BLUE, 1);
    blueParticle.fillCircle(16, 16, 14);
    blueParticle.lineStyle(2, 0xffffff, 0.5);
    blueParticle.strokeCircle(16, 16, 14);
    blueParticle.generateTexture('particle-blue', 32, 32);

    // Create door closed texture
    const doorClosed = this.make.graphics({ x: 0, y: 0, add: false });
    doorClosed.fillStyle(COLORS.DOOR_CLOSED, 1);
    doorClosed.fillRect(0, 0, 20, 80);
    doorClosed.generateTexture('door-closed', 20, 80);

    // Create door open texture
    const doorOpen = this.make.graphics({ x: 0, y: 0, add: false });
    doorOpen.fillStyle(COLORS.DOOR_OPEN, 0.3);
    doorOpen.fillRect(0, 0, 20, 80);
    doorOpen.lineStyle(2, COLORS.DOOR_OPEN, 1);
    doorOpen.strokeRect(0, 0, 20, 80);
    doorOpen.generateTexture('door-open', 20, 80);

    // Create mobile button texture
    const mobileBtn = this.make.graphics({ x: 0, y: 0, add: false });
    mobileBtn.fillStyle(0x4444ff, 0.8);
    mobileBtn.fillCircle(50, 50, 48);
    mobileBtn.lineStyle(4, 0xffffff, 1);
    mobileBtn.strokeCircle(50, 50, 48);
    mobileBtn.generateTexture('mobile-button', 100, 100);

    // Create mobile button pressed texture
    const mobileBtnPressed = this.make.graphics({ x: 0, y: 0, add: false });
    mobileBtnPressed.fillStyle(0x6666ff, 1);
    mobileBtnPressed.fillCircle(50, 50, 48);
    mobileBtnPressed.lineStyle(4, 0xffffff, 1);
    mobileBtnPressed.strokeCircle(50, 50, 48);
    mobileBtnPressed.generateTexture('mobile-button-pressed', 100, 100);
  }

  create() {
    // Short delay then go to menu
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
