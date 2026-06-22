export class UpgradeOverlay {
  constructor(root, optionsRoot) {
    this.root = root;
    this.optionsRoot = optionsRoot;
  }

  show(choices, onSelect) {
    this.optionsRoot.innerHTML = '';
    choices.forEach((choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'upgrade-card';
      button.innerHTML = `<strong>${choice.title}</strong><span>${choice.description}</span>`;
      button.addEventListener('click', () => onSelect(choice), { once: true });
      this.optionsRoot.appendChild(button);
    });
    this.root.hidden = false;
  }

  hide() {
    this.root.hidden = true;
    this.optionsRoot.innerHTML = '';
  }
}
