import './styles.css';
import { EventBus } from './core/EventBus.js';
import { ArenaScene } from './scenes/ArenaScene.js';
import { Hud } from './ui/Hud.js';
import { ToastHost } from './ui/Toast.js';
import { UpgradeOverlay } from './ui/UpgradeOverlay.js';
import { MobileControls } from './ui/MobileControls.js';
import { createNebulaBackground } from './three/createNebulaBackground.js';

const refs = {
  startOverlay: document.querySelector('[data-start-overlay]'),
  startGame: document.querySelector('[data-start-game]'),
  resumeButton: document.querySelector('[data-resume-button]'),
  restartButton: document.querySelector('[data-restart-button]'),
  pauseOverlay: document.querySelector('[data-pause-overlay]'),
  upgradeOverlay: document.querySelector('[data-upgrade-overlay]'),
  upgradeOptions: document.querySelector('[data-upgrade-options]'),
  gameOverOverlay: document.querySelector('[data-game-over-overlay]'),
  gameOverSummary: document.querySelector('[data-game-over-summary]'),
  gameOverRestart: document.querySelector('[data-game-over-restart]'),
  canvasRoot: document.querySelector('[data-game-canvas]'),
  threeRoot: document.querySelector('[data-three-background]'),
  hud: document.querySelector('[data-hud]'),
  toastRegion: document.querySelector('[data-toast-region]'),
  mobileControls: document.querySelector('[data-mobile-controls]')
};

const events = new EventBus();
const toast = new ToastHost(refs.toastRegion);
const hud = new Hud(refs.hud);
const upgradeOverlay = new UpgradeOverlay(refs.upgradeOverlay, refs.upgradeOptions);
const threeBackground = createNebulaBackground(refs.threeRoot);
const arena = new ArenaScene({
  canvasRoot: refs.canvasRoot,
  hud,
  upgradeOverlay,
  pauseOverlay: refs.pauseOverlay,
  gameOverOverlay: {
    root: refs.gameOverOverlay,
    summary: refs.gameOverSummary
  },
  events,
  toast
});

let mobileControls;
let arenaReady = false;

setupGameControls();
startThreeLoop();
bootArena();

async function bootArena() {
  await ensureArena();
  arena.prepareForStart();
  showStartOverlay();
}

function setupGameControls() {
  refs.startGame.addEventListener('click', async () => {
    await ensureArena();
    refs.startOverlay.hidden = true;
    refs.gameOverOverlay.hidden = true;
    arena.start();
  });

  refs.resumeButton.addEventListener('click', () => arena.setPaused(false, 'manual'));
  refs.restartButton.addEventListener('click', () => {
    arena.prepareForStart();
    showStartOverlay();
  });

  refs.gameOverRestart.addEventListener('click', () => {
    arena.prepareForStart();
    showStartOverlay();
  });
}

async function ensureArena() {
  if (arenaReady) return;
  await arena.init();
  mobileControls = new MobileControls(refs.mobileControls, arena.input);
  mobileControls.bind();
  arenaReady = true;
  requestAnimationFrame(() => {
    threeBackground.resize();
    arena.resize();
  });
}

function showStartOverlay() {
  refs.pauseOverlay.hidden = true;
  refs.upgradeOverlay.hidden = true;
  refs.gameOverOverlay.hidden = true;
  refs.startOverlay.hidden = false;
  refs.startGame.focus({ preventScroll: true });
}

function startThreeLoop() {
  const animate = (time) => {
    threeBackground.update(time);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}
