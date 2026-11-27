"use strict";

const canvas = document.querySelector("#scene");
const context = canvas.getContext("2d");
const playArea = document.querySelector("#play-area");
const playButton = document.querySelector("#play-button");
const gameOver = document.querySelector("#game-over");
const controls = document.querySelector("#game-controls");
const message = document.querySelector("#game-message");
const scoreLabel = document.querySelector("#score");
const bestLabel = document.querySelector("#best-score");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const standardKey = "kodiraj.frog-jump.best";
const spaceKey = "kodiraj.secrets.space.best";
const ground = 120;
const frogX = 24;
const frogSize = { width: 32, height: 24 };
const step = 1 / 120;
const ink = "#252922";
const frogColors = { d: "#285b36", g: "#78b856", l: "#e4efb1", e: ink };
const frog = [
  "..dddd....dddd..",
  "..dgld....dgld..",
  ".ddglddddddgldd.",
  ".dgggedgggggedd.",
  "ddggggggggggggdd",
  "dgggggeeeegggggd",
  "dggggggggggggggd",
  "dggllllllllllggd",
  "ddggllllllllggdd",
  ".dggggggggggggd.",
  "ddggddddddggdddd",
  "ddddd....dddddd."
];

const obstacles = [
  {
    pixels: ["..#...#..", "...#.#...", "..#####..", "#.##.##.#", ".#######.", "..##.##..", ".#######.", "#.#####.#", "..#...#.."],
    width: 18, height: 18
  },
  {
    pixels: ["....####...", "..########.", ".###.######", "####..#####", "###########", "###########"],
    width: 22, height: 12
  },
  {
    pixels: ["....#...#....", "...#....#.#..", "..#....#...#.", ".#.....#....#", "..#...#....#.", "...#..#...#..", "....##...#..."],
    width: 26, height: 14
  }
];
const cloud = [".....#####.....", "...##.....##...", ".##.........##.", "###############"];
const clouds = [{ x: 0.28, y: 26 }, { x: 0.76, y: 14 }];
const crown = ["#.#.#", "#####", ".###."];
const star = ["..#..", ".###.", "#####", ".###.", "..#.."];
const hat = [".....##.", "...###.#", "..####..", "#######."];

let width = canvas.width;
let mode = "classic";
let night = false;
let kingUnlocked = window.KodirajSecrets?.has("king") ?? false;
let state = "ready";
let height = 0;
let velocity = 0;
let elapsed = 0;
let distance = 0;
let score = 0;
let best = readBest();
const sessionBests = { classic: best, space: 0 };
let hazards = [];
let previousTime;
let accumulator = 0;
let scheduledFrame;

function scoreKey() { return mode === "space" ? spaceKey : standardKey; }

function readBest(key = scoreKey()) {
  try {
    const stored = Number(localStorage.getItem(key));
    return Number.isSafeInteger(stored) && stored > 0 ? stored : 0;
  } catch {
    return 0;
  }
}

function updateScore() {
  const nextScore = Math.floor(elapsed * 10);
  if (nextScore === score) return;

  const earnedCrown = nextScore >= 1000 && best < 1000;
  score = nextScore;
  scoreLabel.textContent = String(score).padStart(5, "0");
  if (score > best) {
    best = score;
    bestLabel.textContent = String(best).padStart(5, "0");
  }
  if (earnedCrown) {
    saveBest();
    document.dispatchEvent(new CustomEvent("kodiraj:frog-score", { detail: score }));
  }
}

function saveBest() {
  sessionBests[mode] = best;
  try {
    best = Math.max(best, readBest());
    localStorage.setItem(scoreKey(), String(best));
    bestLabel.textContent = String(best).padStart(5, "0");
  } catch {
    // The in-memory record is still available if browser storage is blocked.
  }
}

function drawSprite(pixels, x, y, palette, scale = 2) {
  const left = Math.round(x);
  const top = Math.round(y);
  pixels.forEach((row, rowIndex) => {
    for (let column = 0; column < row.length; column += 1) {
      const color = palette[row[column]];
      if (!color) continue;
      context.fillStyle = color;
      context.fillRect(left + column * scale, top + rowIndex * scale, scale, scale);
    }
  });
}

function wrap(value, period) {
  return ((value % period) + period) % period;
}

function draw() {
  context.clearRect(0, 0, width, canvas.height);
  const retro = document.documentElement.dataset.theme === "retro";
  const sceneryInk = retro ? "#b9ed99" : ink;
  const cloudOffset = reducedMotion.matches ? 0 : elapsed * 12;
  for (const { x, y } of clouds) {
    drawSprite(mode === "space" ? star : cloud, wrap(x * width + 32 - cloudOffset, width + 32) - 32, y, { "#": retro ? "#63825b" : "#c4c9c0" });
  }

  context.fillStyle = sceneryInk;
  context.fillRect(0, ground, width, 1);
  context.fillStyle = "#aeb4a9";
  const groundOffset = reducedMotion.matches ? 0 : distance;
  for (let x = -Math.floor(groundOffset % 53); x < width; x += 53) {
    context.fillRect(x, ground + 5, 4, 1);
    context.fillRect(x + 19, ground + 9, 2, 1);
  }

  const frogY = ground - frogSize.height - height;
  const costume = retro ? { d: "#416946", g: "#85b66d", l: "#c5eea0", e: "#17251a" }
    : night ? { ...frogColors, d: "#414f6e", g: "#8794ba" } : frogColors;
  drawSprite(frog, frogX, frogY, costume);
  if (night && mode !== "space") {
    drawSprite(hat, frogX + 3, frogY - 7, { "#": retro ? "#b5df96" : "#646d93" });
    context.fillStyle = retro ? "#496c48" : "#596788";
    for (const offset of [8, 14, 20]) context.fillRect(frogX + offset, Math.round(frogY) + 16, 2, 4);
  }
  if (mode === "space") {
    context.strokeStyle = sceneryInk;
    context.strokeRect(frogX - 2.5, Math.round(frogY) - 3.5, 36, 27);
    context.fillStyle = "#c4c9c0";
    context.fillRect(frogX, Math.round(frogY) + 24, 32, 3);
  }
  if (document.documentElement.classList.contains("matrix-mode")) {
    context.fillStyle = ink;
    for (const offset of [4, 18]) context.fillRect(frogX + offset, Math.round(frogY) + 4, 10, 5);
    context.fillRect(frogX + 12, Math.round(frogY) + 5, 7, 2);
  }
  if (kingUnlocked || (mode === "classic" && best >= 1000)) {
    drawSprite(crown, frogX + 11, frogY - 10, { "#": retro ? "#b5df96" : "#bc8718" });
  }
  const scenery = state === "ready"
    ? [{ x: width * 0.65, sprite: obstacles[0] }, { x: width * 0.86, sprite: obstacles[1] }]
    : hazards;
  for (const { x, sprite } of scenery) {
    drawSprite(sprite.pixels, x, ground - sprite.height, { "#": sceneryInk });
  }
}

function touchesFrog({ x, sprite }) {
  // Inset the visible sprites so a near miss at an empty corner is forgiving.
  return frogX + frogSize.width - 4 > x + 2
    && frogX + 4 < x + sprite.width - 2
    && height + 2 < sprite.height - 2;
}

function simulate() {
  elapsed += step;
  const speed = Math.min(390, 190 + elapsed * 5);
  distance += speed * step;
  if (height > 0 || velocity > 0) {
    velocity -= (mode === "space" ? 780 : 1250) * step;
    height = Math.max(0, height + velocity * step);
    if (height === 0) velocity = 0;
  }

  for (const hazard of hazards) hazard.x -= speed * step;
  hazards = hazards.filter(({ x, sprite }) => x + sprite.width > 0);
  const last = hazards.at(-1);
  if (!last || width - last.x >= last.gap) {
    const sprite = obstacles[Math.floor(Math.random() * obstacles.length)];
    const gap = speed * (0.99 + Math.random() * 0.42) + sprite.width;
    hazards.push({ x: width, sprite, gap });
  }

  updateScore();
  const collision = hazards.find(touchesFrog);
  if (collision) endGame(Boolean(collision.first));
}

function frame(time) {
  if (state !== "running") return;
  accumulator += Math.min(0.05, (time - (previousTime ?? time)) / 1000);
  previousTime = time;
  while (accumulator >= step && state === "running") {
    simulate();
    accumulator -= step;
  }
  draw();
  if (state === "running") scheduledFrame = requestAnimationFrame(frame);
}

function startGame() {
  elapsed = distance = height = score = accumulator = 0;
  velocity = 0;
  previousTime = undefined;
  hazards = [{ x: Math.max(width, 290), sprite: obstacles[0], gap: 235, first: true }];
  const hour = new Date().getHours();
  night = hour < 4;
  scoreLabel.textContent = "00000";
  gameOver.hidden = true;
  document.dispatchEvent(new CustomEvent("kodiraj:frog-start", { detail: { night, mode } }));
  resumeGame();
}

function resumeGame() {
  state = "running";
  previousTime = undefined;
  message.textContent = "Прескокнувај ги пречките!";
  playArea.setAttribute("aria-label", "Скокни");
  playArea.focus({ preventScroll: true });
  playButton.disabled = true;
  scheduledFrame = requestAnimationFrame(frame);
}

function endGame(first) {
  state = "over";
  saveBest();
  gameOver.hidden = false;
  message.textContent = `Game over! И програмерите понекогаш наидуваат на багови. Поени: ${score}.`;
  playArea.setAttribute("aria-label", "Играј повторно");
  playButton.textContent = "Играј повторно";
  playButton.disabled = false;
  document.dispatchEvent(new CustomEvent("kodiraj:frog-collision", { detail: { first, mode } }));
}

function activate(jumpOnStart = false) {
  if (state === "paused") {
    resumeGame();
    return;
  }
  if (state !== "running") {
    const wasReady = state === "ready";
    startGame();
    if (!wasReady || !jumpOnStart) return;
  }
  if (height === 0 && velocity === 0) velocity = 360;
}

function resize() {
  const measuredWidth = Math.round(canvas.getBoundingClientRect().width);
  if (!measuredWidth) return;
  width = measuredWidth;
  canvas.width = width;
  draw();
}

// Controls are scoped to the two game buttons so Space and arrows can scroll elsewhere.
for (const button of [playArea, playButton]) {
  button.addEventListener("keydown", (event) => {
    const isJump = event.code === "Space" || event.code === "ArrowUp";
    const isEnter = event.code === "Enter";
    if (!isJump && !isEnter) return;
    event.preventDefault();
    if (event.repeat) return;
    if (isJump) activate(button === playArea);
    else if (state !== "running") activate();
  });
}

playArea.addEventListener("click", (event) => {
  const bounds = playArea.getBoundingClientRect();
  const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
  if (event.detail && x >= frogX && x <= frogX + frogSize.width && y >= ground - height - frogSize.height && y <= ground - height) {
    document.dispatchEvent(new Event("kodiraj:frog-press"));
  }
  activate(true);
});
playButton.addEventListener("click", () => activate());
document.querySelector("#frog").addEventListener("arcade:deselect", () => {
  if (state !== "running") return;
  cancelAnimationFrame(scheduledFrame);
  state = "paused";
  saveBest();
  message.textContent = "Играта е паузирана.";
  playArea.setAttribute("aria-label", "Продолжи ја играта");
  playButton.textContent = "Продолжи";
  playButton.disabled = false;
});
document.addEventListener("visibilitychange", () => { previousTime = undefined; });
window.addEventListener("pagehide", saveBest);
reducedMotion.addEventListener("change", draw);
document.addEventListener("kodiraj:theme", draw);
document.addEventListener("kodiraj:awards", () => {
  kingUnlocked = window.KodirajSecrets?.has("king") ?? false;
  if (state !== "running") draw();
});
document.addEventListener("kodiraj:matrix", () => { if (state !== "running") draw(); });
document.addEventListener("kodiraj:frog-mode", (event) => {
  const nextMode = event.detail;
  if (!["classic", "space"].includes(nextMode) || nextMode === mode || (nextMode === "space" && !window.KodirajSecrets?.has("space"))) return;
  saveBest();
  cancelAnimationFrame(scheduledFrame);
  mode = nextMode;
  state = "ready";
  height = elapsed = distance = score = 0;
  night = false;
  best = Math.max(sessionBests[mode], readBest());
  scoreLabel.textContent = "00000";
  bestLabel.textContent = String(best).padStart(5, "0");
  gameOver.hidden = true;
  playArea.setAttribute("aria-label", "Започни Frog Jump");
  playButton.textContent = "Играј";
  playButton.disabled = false;
  message.textContent = mode === "space" ? "Frog in Space · Помала гравитација, поголеми скокови." : "Додека ја подготвуваме платформата, обиди се да ги прескокнеш сите багови!";
  draw();
});
new ResizeObserver(resize).observe(canvas);

bestLabel.textContent = String(best).padStart(5, "0");
playArea.hidden = controls.hidden = playButton.hidden = false;
resize();
