export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, callback) {
    const listeners = this.listeners.get(eventName) ?? new Set();
    listeners.add(callback);
    this.listeners.set(eventName, listeners);
    return () => listeners.delete(callback);
  }

  emit(eventName, payload) {
    const listeners = this.listeners.get(eventName);
    if (!listeners) return;
    listeners.forEach((callback) => callback(payload));
  }
}
