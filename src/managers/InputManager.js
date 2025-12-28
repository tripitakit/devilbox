export default class InputManager {
  constructor(scene, onOpen, onClose) {
    this.scene = scene;
    this.isDoorOpen = false;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.keysDown = new Set();

    this.setupKeyboardInput();
  }

  setupKeyboardInput() {
    this.scene.input.keyboard.on('keydown', (event) => {
      // Ignore if it's a system key
      if (event.key === 'Escape') {
        this.scene.events.emit('pauseRequested');
        return;
      }

      this.keysDown.add(event.code);
      if (!this.isDoorOpen) {
        this.isDoorOpen = true;
        this.onOpen();
      }
    });

    this.scene.input.keyboard.on('keyup', (event) => {
      this.keysDown.delete(event.code);

      // Only close if no keys are held
      if (this.keysDown.size === 0 && this.isDoorOpen) {
        this.isDoorOpen = false;
        this.onClose();
      }
    });
  }

  forceClose() {
    this.isDoorOpen = false;
    this.keysDown.clear();
    this.onClose();
  }

  destroy() {
    this.scene.input.keyboard.off('keydown');
    this.scene.input.keyboard.off('keyup');
  }
}
