export class ObjectPool {
  constructor(createItem, resetItem = () => {}) {
    this.createItem = createItem;
    this.resetItem = resetItem;
    this.available = [];
    this.active = new Set();
  }

  acquire(payload) {
    const item = this.available.pop() ?? this.createItem();
    this.resetItem(item, payload);
    this.active.add(item);
    return item;
  }

  release(item) {
    if (!this.active.has(item)) return;
    this.active.delete(item);
    this.available.push(item);
  }

  releaseAll() {
    Array.from(this.active).forEach((item) => this.release(item));
  }

  getActiveItems() {
    return Array.from(this.active);
  }

  get size() {
    return this.active.size + this.available.length;
  }
}
