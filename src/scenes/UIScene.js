import Phaser from 'phaser';
import MobileButton from '../objects/MobileButton.js';
import { COLORS } from '../utils/constants.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  init(data) {
    this.levelId = data.levelId;
    this.levelName = data.levelName;
    this.timeLimit = data.timeLimit;
  }

  create() {
    const { width, height } = this.cameras.main;
    const isMobile = this.registry.get('isMobile');

    // Level info (top left)
    this.add.text(20, 15, `Level ${this.levelId}`, {
      fontSize: '24px',
      color: COLORS.UI_TEXT,
      fontStyle: 'bold'
    });

    this.add.text(20, 45, this.levelName, {
      fontSize: '16px',
      color: COLORS.UI_SECONDARY
    });

    // Timer (top center)
    this.timerText = this.add.text(width / 2, 20, '0:00', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: COLORS.UI_TEXT
    }).setOrigin(0.5, 0);

    if (this.timeLimit) {
      this.timeLimitText = this.add.text(width / 2, 55, `Limit: ${this.formatTime(this.timeLimit)}`, {
        fontSize: '14px',
        color: COLORS.UI_SECONDARY
      }).setOrigin(0.5, 0);
    }

    // Pause button (top right)
    this.createPauseButton(width - 60, 35);

    // Entropy meter (bottom)
    this.createEntropyMeter(width / 2, height - 40);

    // Particle counts
    this.createParticleCounts(width, height);

    // Mobile button
    if (isMobile) {
      this.createMobileButton(width - 70, height - 150);
    }

    // Instructions
    const instruction = isMobile ? 'Hold button to open door' : 'Hold any key to open door';
    this.instructionText = this.add.text(width / 2, height - 80, instruction, {
      fontSize: '14px',
      color: COLORS.UI_SECONDARY
    }).setOrigin(0.5);

    // Listen for updates from game scene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('updateUI', this.updateUI, this);

    this.events.on('shutdown', () => {
      gameScene.events.off('updateUI', this.updateUI, this);
    });
  }

  createPauseButton(x, y) {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 50, 50, 0x333366, 1);
    bg.setStrokeStyle(2, 0x6666aa);

    const pauseIcon = this.add.text(0, 0, '||', {
      fontSize: '24px',
      color: COLORS.UI_TEXT,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.add([bg, pauseIcon]);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerup', () => {
      const gameScene = this.scene.get('GameScene');
      gameScene.events.emit('pauseRequested');
    });
  }

  createEntropyMeter(x, y) {
    // Background
    this.entropyBg = this.add.rectangle(x, y, 300, 20, 0x333333);

    // Fill bar
    this.entropyFill = this.add.rectangle(x - 148, y, 296, 16, 0x00ff00);
    this.entropyFill.setOrigin(0, 0.5);

    // Label
    this.add.text(x - 150, y - 25, 'ENTROPY', {
      fontSize: '12px',
      color: COLORS.UI_SECONDARY
    });

    // Value text
    this.entropyValue = this.add.text(x + 150, y - 25, '100%', {
      fontSize: '12px',
      color: COLORS.UI_SECONDARY
    }).setOrigin(1, 0);
  }

  createParticleCounts(width, height) {
    // Left side counts
    this.leftRedText = this.add.text(80, height / 2 - 180, 'Red: 0', {
      fontSize: '14px',
      color: COLORS.RED_HEX
    }).setOrigin(0.5);

    this.leftBlueText = this.add.text(80, height / 2 - 160, 'Blue: 0', {
      fontSize: '14px',
      color: COLORS.BLUE_HEX
    }).setOrigin(0.5);

    // Right side counts
    this.rightRedText = this.add.text(width - 80, height / 2 - 180, 'Red: 0', {
      fontSize: '14px',
      color: COLORS.RED_HEX
    }).setOrigin(0.5);

    this.rightBlueText = this.add.text(width - 80, height / 2 - 160, 'Blue: 0', {
      fontSize: '14px',
      color: COLORS.BLUE_HEX
    }).setOrigin(0.5);
  }

  createMobileButton(x, y) {
    this.mobileButton = new MobileButton(this, x, y);

    this.mobileButton.on('press', () => {
      const gameScene = this.scene.get('GameScene');
      if (gameScene.door) {
        gameScene.door.open();
      }
    });

    this.mobileButton.on('release', () => {
      const gameScene = this.scene.get('GameScene');
      if (gameScene.door) {
        gameScene.door.close();
      }
    });
  }

  updateUI(data) {
    // Update timer
    this.timerText.setText(this.formatTime(data.time));

    // Change timer color if running low on time
    if (this.timeLimit) {
      const remaining = this.timeLimit - data.time;
      if (remaining < 10) {
        this.timerText.setColor('#ff4444');
      } else if (remaining < 30) {
        this.timerText.setColor('#ffaa44');
      }
    }

    // Update entropy meter
    const entropyPercent = data.entropy * 100;
    this.entropyFill.width = 296 * data.entropy;
    this.entropyValue.setText(`${Math.round(entropyPercent)}%`);

    // Color gradient for entropy (green = low/good, red = high/bad)
    const r = Math.round(data.entropy * 255);
    const g = Math.round((1 - data.entropy) * 255);
    this.entropyFill.setFillStyle(Phaser.Display.Color.GetColor(r, g, 0));

    // Update particle counts
    this.leftRedText.setText(`Red: ${data.counts.redLeft}`);
    this.leftBlueText.setText(`Blue: ${data.counts.blueLeft}`);
    this.rightRedText.setText(`Red: ${data.counts.redRight}`);
    this.rightBlueText.setText(`Blue: ${data.counts.blueRight}`);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
