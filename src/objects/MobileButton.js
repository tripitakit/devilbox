import Phaser from 'phaser';

export default class MobileButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.isPressed = false;
    this.scene = scene;

    this.createButton();

    scene.add.existing(this);
  }

  createButton() {
    // Button background
    this.buttonBg = this.scene.add.sprite(0, 0, 'mobile-button');
    this.buttonBg.setDisplaySize(100, 100);

    // Door icon text
    this.icon = this.scene.add.text(0, -5, 'DOOR', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instruction text
    this.instruction = this.scene.add.text(0, 70, 'HOLD TO OPEN', {
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add([this.buttonBg, this.icon, this.instruction]);

    // Enable input
    this.buttonBg.setInteractive();

    this.buttonBg.on('pointerdown', () => this.onPress());
    this.buttonBg.on('pointerup', () => this.onRelease());
    this.buttonBg.on('pointerout', () => this.onRelease());
  }

  onPress() {
    if (this.isPressed) return;

    this.isPressed = true;
    this.buttonBg.setTexture('mobile-button-pressed');
    this.emit('press');
  }

  onRelease() {
    if (!this.isPressed) return;

    this.isPressed = false;
    this.buttonBg.setTexture('mobile-button');
    this.emit('release');
  }
}
