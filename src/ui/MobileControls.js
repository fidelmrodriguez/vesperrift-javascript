export class MobileControls {
  constructor(root, input) {
    this.root = root;
    this.input = input;
    this.cleanups = [];
  }

  bind() {
    this.root.querySelectorAll('[data-touch-key]').forEach((button) => {
      const code = button.dataset.touchKey;
      const blockNativeGesture = (event) => event.preventDefault();
      const press = (event) => {
        event.preventDefault();
        this.capturePointer(button, event.pointerId);
        this.input.setTouchKey(code, true);
      };
      const release = (event) => {
        event.preventDefault();
        this.releasePointer(button, event.pointerId);
        this.input.setTouchKey(code, false);
      };
      button.addEventListener('pointerdown', press);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointerleave', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('contextmenu', blockNativeGesture);
      button.addEventListener('selectstart', blockNativeGesture);
      this.cleanups.push(() => button.removeEventListener('pointerdown', press));
      this.cleanups.push(() => button.removeEventListener('pointerup', release));
      this.cleanups.push(() => button.removeEventListener('pointerleave', release));
      this.cleanups.push(() => button.removeEventListener('pointercancel', release));
      this.cleanups.push(() => button.removeEventListener('contextmenu', blockNativeGesture));
      this.cleanups.push(() => button.removeEventListener('selectstart', blockNativeGesture));
    });

    const dash = this.root.querySelector('[data-touch-dash]');
    const blockNativeGesture = (event) => event.preventDefault();
    const onDash = (event) => {
      event.preventDefault();
      this.capturePointer(dash, event.pointerId);
      this.input.triggerDash();
    };
    const releaseDash = (event) => {
      event.preventDefault();
      this.releasePointer(dash, event.pointerId);
    };
    dash.addEventListener('pointerdown', onDash);
    dash.addEventListener('pointerup', releaseDash);
    dash.addEventListener('pointercancel', releaseDash);
    dash.addEventListener('contextmenu', blockNativeGesture);
    dash.addEventListener('selectstart', blockNativeGesture);
    this.cleanups.push(() => dash.removeEventListener('pointerdown', onDash));
    this.cleanups.push(() => dash.removeEventListener('pointerup', releaseDash));
    this.cleanups.push(() => dash.removeEventListener('pointercancel', releaseDash));
    this.cleanups.push(() => dash.removeEventListener('contextmenu', blockNativeGesture));
    this.cleanups.push(() => dash.removeEventListener('selectstart', blockNativeGesture));
  }

  capturePointer(button, pointerId) {
    try {
      button.setPointerCapture?.(pointerId);
    } catch {
      // Navegadores mobile podem encerrar o ponteiro antes do capture.
    }
  }

  releasePointer(button, pointerId) {
    try {
      button.releasePointerCapture?.(pointerId);
    } catch {
      // Evita erro quando o navegador já liberou o ponteiro.
    }
  }

  destroy() {
    this.cleanups.forEach((callback) => callback());
    this.cleanups = [];
  }
}
