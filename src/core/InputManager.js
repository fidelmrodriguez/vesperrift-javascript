export class InputManager {
  constructor(targetElement) {
    this.targetElement = targetElement;
    this.keys = new Set();
    this.pointer = { x: 0, y: 0, worldX: 0, worldY: 0, active: false };
    this.dashPressed = false;
    this.pausePressed = false;
    this.touchKeys = new Set();
    this.unsubscribe = [];
  }

  bind() {
    const controlledKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Space', 'Escape']);

    const onKeyDown = (event) => {
      if (controlledKeys.has(event.code)) {
        event.preventDefault();
      }
      this.keys.add(event.code);
      if (event.code === 'Space') this.dashPressed = true;
      if (event.code === 'Escape') this.pausePressed = true;
    };

    const onKeyUp = (event) => {
      if (controlledKeys.has(event.code)) {
        event.preventDefault();
      }
      this.keys.delete(event.code);
    };

    const onPointerMove = (event) => {
      const rect = this.targetElement.getBoundingClientRect();
      this.pointer.x = event.clientX - rect.left;
      this.pointer.y = event.clientY - rect.top;
      this.pointer.active = true;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    this.targetElement.addEventListener('pointermove', onPointerMove);

    this.unsubscribe.push(() => window.removeEventListener('keydown', onKeyDown));
    this.unsubscribe.push(() => window.removeEventListener('keyup', onKeyUp));
    this.unsubscribe.push(() => this.targetElement.removeEventListener('pointermove', onPointerMove));
  }

  destroy() {
    this.unsubscribe.forEach((callback) => callback());
    this.unsubscribe = [];
  }

  reset() {
    this.keys.clear();
    this.touchKeys.clear();
    this.dashPressed = false;
    this.pausePressed = false;
  }

  setTouchKey(code, isPressed) {
    if (isPressed) this.touchKeys.add(code);
    else this.touchKeys.delete(code);
  }

  triggerDash() {
    this.dashPressed = true;
  }

  consumeDash() {
    const pressed = this.dashPressed;
    this.dashPressed = false;
    return pressed;
  }

  consumePause() {
    const pressed = this.pausePressed;
    this.pausePressed = false;
    return pressed;
  }

  getAxis() {
    const pressed = (code) => this.keys.has(code) || this.touchKeys.has(code);
    const x = Number(pressed('KeyD') || pressed('ArrowRight')) - Number(pressed('KeyA') || pressed('ArrowLeft'));
    const y = Number(pressed('KeyS') || pressed('ArrowDown')) - Number(pressed('KeyW') || pressed('ArrowUp'));
    const length = Math.hypot(x, y) || 1;

    return { x: x / length, y: y / length, moving: x !== 0 || y !== 0 };
  }

  updatePointerWorld(camera) {
    this.pointer.worldX = this.pointer.x + camera.x;
    this.pointer.worldY = this.pointer.y + camera.y;
  }
}
