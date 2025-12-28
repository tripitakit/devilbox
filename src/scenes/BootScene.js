import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Detect mobile device
    const isMobile = this.sys.game.device.os.android ||
                     this.sys.game.device.os.iOS ||
                     this.sys.game.device.os.windowsPhone;

    // Store in registry for access across scenes
    this.registry.set('isMobile', isMobile);

    // Initialize default settings if not exists
    const savedSettings = localStorage.getItem('devilbox_settings');
    if (!savedSettings) {
      const defaultSettings = {
        sfxVolume: 0.7,
        musicVolume: 0.5,
        sfxEnabled: true,
        musicEnabled: true
      };
      localStorage.setItem('devilbox_settings', JSON.stringify(defaultSettings));
    }

    // Initialize save data if not exists
    const savedProgress = localStorage.getItem('devilbox_save');
    if (!savedProgress) {
      const defaultProgress = {
        currentLevel: 1,
        unlockedLevels: [1],
        levelScores: {},
        totalPlayTime: 0
      };
      localStorage.setItem('devilbox_save', JSON.stringify(defaultProgress));
    }

    // Proceed to preload
    this.scene.start('PreloadScene');
  }
}
