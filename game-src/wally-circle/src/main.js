import * as THREE from 'three';
import { createWally } from './wally.js';
import { createWorld } from './world.js';
import { createControls } from './controls.js';
import { createMovement, moveWally } from './movement.js';
import { createChallenge, updateChallenge, OUTSIDE_SECONDS } from './challenge.js';
import { createFood, advanceFood, eatBananas } from './food.js';
import { createBananas } from './bananas.js';
import { createChestState, openChests, CHEST_REWARD } from './chest-state.js';
import { createChests } from './chests.js';
import { getGrowthView } from './view.js';
import './game.css';

const root = document.querySelector('[data-wally-game]');
if (root) boot(root);

function boot(root) {
  const stage = root.querySelector('.wally-stage');
  const host = root.querySelector('.wally-canvas-host');
  const overlay = root.querySelector('.wally-overlay');
  const title = root.querySelector('[data-overlay-title]');
  const description = root.querySelector('[data-overlay-description]');
  const playButton = root.querySelector('[data-play]');
  const pauseButton = root.querySelector('[data-pause]');
  const resetButton = root.querySelector('[data-reset]');
  const joystick = root.querySelector('.wally-joystick');
  const distanceLabel = root.querySelector('[data-distance]');
  const snackLabel = root.querySelector('[data-snacks]');
  const chestReward = root.querySelector('[data-chest-reward]');
  const status = root.querySelector('[data-status]');
  const boundaryHud = root.querySelector('[data-boundary-hud]');
  const safeMessage = root.querySelector('[data-safe-message]');
  const warning = root.querySelector('[data-boundary-warning]');
  const countdown = root.querySelector('[data-countdown]');
  let renderer;
  let controls;
  let state = createMovement();
  let challenge = createChallenge();
  let food = createFood();
  let chestState = createChestState(food.items);
  let rewardRemaining = 0;
  let displayedSize = 1;
  let viewScale = 1;
  let running = false;
  let ready = false;
  let failed = false;
  let previousTime;
  let scene;
  let camera;
  let wally;
  let world;
  let bananas;
  let chests;
  let sun;
  let resizeObserver;

  function render() {
    if (ready && !failed) renderer.render(scene, camera);
  }
  function positionCamera() {
    const onTitle = root.dataset.state === 'title';
    const wide = host.clientWidth >= 700;
    const offset = onTitle && wide ? -3.3 : 0;
    const view = getGrowthView(displayedSize, camera.aspect);
    viewScale = view.scale;
    camera.position.set(offset, view.cameraHeight, view.cameraDepth);
    camera.lookAt(offset, onTitle && !wide ? 3.1 : view.targetHeight, 0);
    camera.near = view.near;
    camera.far = view.far;
    camera.updateProjectionMatrix();
    scene.fog.near = view.fogNear;
    scene.fog.far = view.fogFar;
    world.update(state.x, state.z, viewScale);
    sun.position.set(-5, 9, 5).multiplyScalar(displayedSize);
    const shadowRange = Math.max(5, displayedSize * 3);
    sun.shadow.normalBias = 0.035 * displayedSize;
    Object.assign(sun.shadow.camera, { left: -shadowRange, right: shadowRange, top: shadowRange, bottom: -shadowRange, near: 0.5 * displayedSize, far: 30 * displayedSize });
    sun.shadow.camera.updateProjectionMatrix();
  }
  function resize() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    positionCamera();
    render();
  }
  function animate(time) {
    const dt = previousTime === undefined ? 0 : (time - previousTime) / 1000;
    previousTime = time;
    const speed = moveWally(state, controls.read(), dt, displayedSize);
    updateChallenge(challenge, state, dt);
    if (!challenge.gameOver) {
      advanceFood(food, dt);
      rewardRemaining = Math.max(0, rewardRemaining - dt);
      const eaten = eatBananas(food, state);
      const opened = openChests(chestState, food, state);
      if (eaten || opened) updateSnackHud();
      if (opened) {
        chestReward.textContent = `${opened === 1 ? 'Chest opened' : 'Chests opened'}! +${opened * CHEST_REWARD} bananas`;
        rewardRemaining = 3;
      }
      chestReward.hidden = rewardRemaining === 0;
    }
    if (displayedSize !== food.size) {
      displayedSize += (food.size - displayedSize) * (1 - Math.exp(-8 * Math.min(dt, 0.05)));
      if (Math.abs(food.size - displayedSize) < 0.001) displayedSize = food.size;
      wally.model.scale.setScalar(displayedSize);
      positionCamera();
    }
    wally.animate(state, speed);
    world.update(state.x, state.z, viewScale);
    bananas.update(food, state, scene.fog.far + 15);
    chests.update(chestState, state, scene.fog.far + 15, dt);
    const distance = `${Math.floor(state.distance)} m explored`;
    if (distanceLabel.textContent !== distance) distanceLabel.textContent = distance;
    updateBoundaryHud();
    if (challenge.gameOver) { endRound(); return; }
    render();
  }
  function updateBoundaryHud() {
    boundaryHud.dataset.zone = challenge.outside ? 'outside' : 'safe';
    safeMessage.hidden = challenge.outside;
    warning.hidden = !challenge.outside;
    const seconds = String(Math.ceil(challenge.remaining));
    if (countdown.textContent !== seconds) countdown.textContent = seconds;
    if (running) {
      const message = challenge.outside
        ? (challenge.remaining <= 3 ? `${seconds} seconds! Get back inside the circle.` : 'Outside the circle! Get back before time runs out.')
        : 'Safe inside the circle';
      if (status.textContent !== message) status.textContent = message;
    }
  }
  function updateSnackHud() {
    snackLabel.textContent = `${food.eaten} ${food.eaten === 1 ? 'banana' : 'bananas'} · Size ${food.size.toFixed(2)}×`;
  }
  function resetRound() {
    state = createMovement();
    challenge = createChallenge();
    food = createFood();
    chestState = createChestState(food.items);
    rewardRemaining = 0;
    chestReward.hidden = true;
    displayedSize = 1;
    wally.model.scale.setScalar(1);
    positionCamera();
    updateSnackHud();
    distanceLabel.textContent = '0 m explored';
    world.update(0, 0, viewScale);
    bananas.update(food, state, scene.fog.far + 15);
    chests.update(chestState, state, scene.fog.far + 15);
    wally.animate(state, 0);
    updateBoundaryHud();
  }
  function endRound() {
    running = false;
    controls.clear();
    renderer.setAnimationLoop(null);
    root.dataset.state = 'gameover';
    chestReward.hidden = true;
    overlay.hidden = false;
    joystick.hidden = true;
    boundaryHud.hidden = true;
    title.textContent = 'Time’s up!';
    description.textContent = `Wally stayed outside the circle for ${OUTSIDE_SECONDS} seconds. Restart to try again.`;
    playButton.textContent = 'Restart';
    pauseButton.disabled = true;
    status.textContent = 'Time’s up. Restart to play again.';
    render();
    playButton.focus({ preventScroll: true });
  }
  function play() {
    if (failed) { window.location.reload(); return; }
    if (!ready) return;
    if (challenge.gameOver) resetRound();
    controls.clear();
    root.dataset.state = 'playing';
    running = true;
    overlay.hidden = true;
    joystick.hidden = false;
    boundaryHud.hidden = false;
    pauseButton.disabled = false;
    pauseButton.textContent = 'Pause';
    updateBoundaryHud();
    positionCamera();
    previousTime = undefined;
    renderer.domElement.focus({ preventScroll: true });
    renderer.setAnimationLoop(animate);
  }
  function pause(focusButton = false) {
    if (!running) return;
    running = false;
    controls.clear();
    renderer.setAnimationLoop(null);
    root.dataset.state = 'paused';
    chestReward.hidden = true;
    overlay.hidden = false;
    joystick.hidden = true;
    title.textContent = 'Taking a breather.';
    description.textContent = challenge.outside
      ? 'Your countdown is paused. Get back inside the circle when you resume.'
      : 'The circle will be right here when you’re ready.';
    playButton.textContent = 'Keep exploring';
    pauseButton.textContent = 'Resume';
    status.textContent = 'Paused';
    render();
    if (focusButton) playButton.focus({ preventScroll: true });
  }
  function showError() {
    failed = true;
    running = false;
    controls?.clear();
    renderer?.setAnimationLoop(null);
    root.dataset.state = 'error';
    chestReward.hidden = true;
    overlay.hidden = false;
    joystick.hidden = true;
    boundaryHud.hidden = true;
    title.textContent = 'Wally needs a hand.';
    description.textContent = 'The 3D meadow couldn’t start. Try refreshing, or use a browser with WebGL 2 enabled.';
    playButton.textContent = 'Try again';
    playButton.disabled = false;
    pauseButton.disabled = true;
    resetButton.disabled = true;
    status.textContent = 'Game unavailable';
  }

  playButton.addEventListener('click', play);
  pauseButton.addEventListener('click', () => running ? pause(true) : play());
  resetButton.addEventListener('click', () => {
    if (!ready || failed) return;
    resetRound();
    play();
  });

  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#d8eff0');
    scene.fog = new THREE.Fog('#d8eff0', 25, 46);
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 150);
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Wally’s 3D meadow. Eat yellow bananas to grow. Touch white chests to open them for nine bananas. Stay inside the dark red circle. Use arrow keys or WASD to move, and Escape to pause.');
    canvas.setAttribute('aria-describedby', 'wally-controls-help');
    host.append(canvas);
    scene.add(new THREE.HemisphereLight('#fff7df', '#769158', 2.4));
    sun = new THREE.DirectionalLight('#fff1ce', 3);
    sun.position.set(-5, 9, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 30 });
    sun.shadow.normalBias = 0.035;
    sun.shadow.bias = -0.00015;
    scene.add(sun);
    world = createWorld(scene);
    bananas = createBananas(scene, food.items.length);
    bananas.update(food, state, scene.fog.far + 15);
    chests = createChests(scene, chestState.items.length);
    chests.update(chestState, state, scene.fog.far + 15);
    wally = createWally();
    scene.add(wally.model);
    controls = createControls({ canvas, joystick, isRunning: () => running, pause });
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); showError(); });
    ready = true;
    root.dataset.state = 'title';
    title.textContent = 'Wally Circle';
    description.textContent = `Eat bananas to grow. Touch a white chest for ${CHEST_REWARD} bananas! Stay inside the red circle, or get back within ${OUTSIDE_SECONDS} seconds.`;
    playButton.textContent = 'Play Wally Circle';
    playButton.disabled = false;
    resetButton.disabled = false;
    status.textContent = 'Ready to play';
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();
  } catch (error) {
    console.error('Wally Circle could not start:', error);
    showError();
  }

  // Stop on navigation, while allowing browsers to restore a paused page from cache.
  window.addEventListener('pagehide', () => pause(false));
  window.addEventListener('pageshow', render);
}
