import Phaser from 'phaser';
import { COLORS } from '../utils/constants.js';
import { audioManager } from '../managers/AudioManager.js';

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  init(data) {
    this.returnScene = data.returnScene || 'MenuScene';
  }

  create() {
    const { width, height } = this.cameras.main;

    // Load current settings
    this.settings = JSON.parse(localStorage.getItem('devilbox_settings') || '{}');

    // Dim overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Title
    this.add.text(width / 2, 80, 'SETTINGS', {
      fontSize: '36px',
      color: COLORS.UI_TEXT,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Sound Effects toggle
    this.createToggle(width / 2, 180, 'Sound Effects', this.settings.sfxEnabled ?? true, (value) => {
      this.settings.sfxEnabled = value;
      audioManager.setSfxEnabled(value);
      this.saveSettings();
    });

    // Music toggle
    this.createToggle(width / 2, 250, 'Music', this.settings.musicEnabled ?? true, (value) => {
      this.settings.musicEnabled = value;
      audioManager.setMusicEnabled(value);
      this.saveSettings();
    });

    // SFX Volume slider
    this.createSlider(width / 2, 330, 'SFX Volume', this.settings.sfxVolume ?? 0.7, (value) => {
      this.settings.sfxVolume = value;
      audioManager.setSfxVolume(value);
      this.saveSettings();
    });

    // Music Volume slider
    this.createSlider(width / 2, 410, 'Music Volume', this.settings.musicVolume ?? 0.5, (value) => {
      this.settings.musicVolume = value;
      audioManager.setMusicVolume(value);
      this.saveSettings();
    });

    // Reset Progress button
    this.createButton(width / 2, 500, 'RESET PROGRESS', () => {
      audioManager.playClick();
      this.resetProgress();
    }, 0x663333);

    // Back button
    this.createButton(width / 2, height - 60, 'BACK', () => {
      audioManager.playClick();
      this.scene.stop();
      if (this.returnScene === 'PauseScene') {
        // PauseScene is still running
      } else {
        this.scene.start(this.returnScene);
      }
    });
  }

  createToggle(x, y, label, initialValue, onChange) {
    // Label
    this.add.text(x - 150, y, label, {
      fontSize: '20px',
      color: COLORS.UI_TEXT
    }).setOrigin(0, 0.5);

    // Toggle button
    const toggleBg = this.add.rectangle(x + 100, y, 80, 36, initialValue ? 0x44aa44 : 0x666666);
    toggleBg.setStrokeStyle(2, 0xffffff);

    const toggleKnob = this.add.circle(
      initialValue ? x + 120 : x + 80,
      y,
      14,
      0xffffff
    );

    const toggleText = this.add.text(x + 100, y, initialValue ? 'ON' : 'OFF', {
      fontSize: '14px',
      color: '#000000'
    }).setOrigin(0.5);

    toggleBg.setInteractive({ useHandCursor: true });

    let isOn = initialValue;
    toggleBg.on('pointerup', () => {
      audioManager.playClick();
      isOn = !isOn;
      toggleBg.setFillStyle(isOn ? 0x44aa44 : 0x666666);
      toggleKnob.x = isOn ? x + 120 : x + 80;
      toggleText.setText(isOn ? 'ON' : 'OFF');
      onChange(isOn);
    });
  }

  createSlider(x, y, label, initialValue, onChange) {
    // Label
    this.add.text(x - 150, y - 15, label, {
      fontSize: '18px',
      color: COLORS.UI_TEXT
    });

    // Value display
    const valueText = this.add.text(x + 160, y - 15, `${Math.round(initialValue * 100)}%`, {
      fontSize: '16px',
      color: COLORS.UI_SECONDARY
    }).setOrigin(1, 0);

    // Track
    const track = this.add.rectangle(x + 50, y + 10, 200, 8, 0x444444);
    track.setOrigin(0.5);

    // Handle
    const handle = this.add.circle(
      x + 50 - 100 + initialValue * 200,
      y + 10,
      12,
      0x4488ff
    );
    handle.setStrokeStyle(2, 0xffffff);
    handle.setInteractive({ draggable: true, useHandCursor: true });

    const minX = x + 50 - 100;
    const maxX = x + 50 + 100;

    handle.on('drag', (pointer, dragX) => {
      handle.x = Phaser.Math.Clamp(dragX, minX, maxX);
      const value = (handle.x - minX) / 200;
      valueText.setText(`${Math.round(value * 100)}%`);
      onChange(value);
    });
  }

  createButton(x, y, text, callback, color = 0x333366) {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 250, 50, color, 1);
    bg.setStrokeStyle(2, 0x6666aa);

    const label = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: COLORS.UI_TEXT
    }).setOrigin(0.5);

    button.add([bg, label]);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(color + 0x111111));
    bg.on('pointerout', () => bg.setFillStyle(color));
    bg.on('pointerup', callback);

    return button;
  }

  saveSettings() {
    localStorage.setItem('devilbox_settings', JSON.stringify(this.settings));
  }

  resetProgress() {
    // Confirm dialog using simple approach
    const { width, height } = this.cameras.main;

    const confirmBg = this.add.rectangle(width / 2, height / 2, 400, 200, 0x222233, 0.95);
    confirmBg.setStrokeStyle(2, 0x6666aa);

    const confirmText = this.add.text(width / 2, height / 2 - 50, 'Reset all progress?', {
      fontSize: '24px',
      color: COLORS.UI_TEXT
    }).setOrigin(0.5);

    const yesBtn = this.add.text(width / 2 - 60, height / 2 + 30, 'YES', {
      fontSize: '24px',
      color: '#ff4444',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const noBtn = this.add.text(width / 2 + 60, height / 2 + 30, 'NO', {
      fontSize: '24px',
      color: '#44ff44',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    yesBtn.on('pointerup', () => {
      const defaultProgress = {
        currentLevel: 1,
        unlockedLevels: [1],
        levelScores: {},
        totalPlayTime: 0
      };
      localStorage.setItem('devilbox_save', JSON.stringify(defaultProgress));

      confirmBg.destroy();
      confirmText.destroy();
      yesBtn.destroy();
      noBtn.destroy();
    });

    noBtn.on('pointerup', () => {
      confirmBg.destroy();
      confirmText.destroy();
      yesBtn.destroy();
      noBtn.destroy();
    });
  }
}
