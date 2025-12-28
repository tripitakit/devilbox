import Phaser from 'phaser';
import { CHAMBER, COLORS } from '../utils/constants.js';

export default class Door {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isOpen = false;
    this.gapHeight = CHAMBER.DOOR_GAP;

    this.createDoor();
  }

  createDoor() {
    // Door sprite (visual)
    this.sprite = this.scene.add.sprite(this.x, this.y, 'door-closed');
    this.sprite.setDisplaySize(20, this.gapHeight);

    // Door blocker (physics body)
    this.blocker = this.scene.add.rectangle(
      this.x, this.y,
      20, this.gapHeight,
      COLORS.DOOR_CLOSED, 0
    );
    this.scene.physics.add.existing(this.blocker, true);

    // Glow effect container
    this.glow = this.scene.add.rectangle(
      this.x, this.y,
      30, this.gapHeight + 10,
      0x000000, 0
    );
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.sprite.setTexture('door-open');
    this.blocker.body.enable = false;

    // Visual feedback - glow
    this.scene.tweens.add({
      targets: this.glow,
      fillAlpha: 0.3,
      fillColor: COLORS.DOOR_OPEN,
      duration: 100
    });
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.sprite.setTexture('door-closed');
    this.blocker.body.enable = true;

    // Remove glow
    this.scene.tweens.add({
      targets: this.glow,
      fillAlpha: 0,
      duration: 100
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  getBlocker() {
    return this.blocker;
  }
}
