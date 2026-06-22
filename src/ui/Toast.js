export class ToastHost {
  constructor(root) {
    this.root = root;
  }

  show(title, message) {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
    this.root.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      window.setTimeout(() => toast.remove(), 180);
    }, 2600);
  }
}
