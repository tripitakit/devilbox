import Phaser from 'phaser';
import { CHAMBER, COLORS } from '../utils/constants.js';

export default class Chamber {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = CHAMBER.WIDTH;
    this.height = CHAMBER.HEIGHT;
    this.wallThickness = CHAMBER.WALL_THICKNESS;
    this.doorGap = CHAMBER.DOOR_GAP;

    this.walls = scene.physics.add.staticGroup();
    this.createWalls();
    this.createVisuals();
  }

  createWalls() {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    const t = this.wallThickness;

    // Top wall
    const topWall = this.scene.add.rectangle(
      this.x, this.y - halfHeight - t / 2,
      this.width + t * 2, t,
      COLORS.WALL
    );
    this.scene.physics.add.existing(topWall, true);
    this.walls.add(topWall);

    // Bottom wall
    const bottomWall = this.scene.add.rectangle(
      this.x, this.y + halfHeight + t / 2,
      this.width + t * 2, t,
      COLORS.WALL
    );
    this.scene.physics.add.existing(bottomWall, true);
    this.walls.add(bottomWall);

    // Left wall
    const leftWall = this.scene.add.rectangle(
      this.x - halfWidth - t / 2, this.y,
      t, this.height,
      COLORS.WALL
    );
    this.scene.physics.add.existing(leftWall, true);
    this.walls.add(leftWall);

    // Right wall
    const rightWall = this.scene.add.rectangle(
      this.x + halfWidth + t / 2, this.y,
      t, this.height,
      COLORS.WALL
    );
    this.scene.physics.add.existing(rightWall, true);
    this.walls.add(rightWall);

    // Center wall - top segment
    const centerWallHeight = (this.height - this.doorGap) / 2;
    this.centerWallTop = this.scene.add.rectangle(
      this.x, this.y - this.doorGap / 2 - centerWallHeight / 2,
      t, centerWallHeight,
      COLORS.WALL
    );
    this.scene.physics.add.existing(this.centerWallTop, true);
    this.walls.add(this.centerWallTop);

    // Center wall - bottom segment
    this.centerWallBottom = this.scene.add.rectangle(
      this.x, this.y + this.doorGap / 2 + centerWallHeight / 2,
      t, centerWallHeight,
      COLORS.WALL
    );
    this.scene.physics.add.existing(this.centerWallBottom, true);
    this.walls.add(this.centerWallBottom);
  }

  createVisuals() {
    // Draw chamber outline for visual clarity
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, 0x666688, 0.5);
    graphics.strokeRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Draw dividing line
    graphics.lineStyle(1, 0x666688, 0.3);
    graphics.lineBetween(
      this.x, this.y - this.height / 2,
      this.x, this.y + this.height / 2
    );

    // Side labels
    this.scene.add.text(
      this.x - this.width / 4, this.y - this.height / 2 - 25,
      'LEFT', { fontSize: '14px', color: '#666688' }
    ).setOrigin(0.5);

    this.scene.add.text(
      this.x + this.width / 4, this.y - this.height / 2 - 25,
      'RIGHT', { fontSize: '14px', color: '#666688' }
    ).setOrigin(0.5);
  }

  getLeftBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2
    };
  }

  getRightBounds() {
    return {
      left: this.x,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2
    };
  }

  getCenterX() {
    return this.x;
  }
}
