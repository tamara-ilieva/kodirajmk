"use strict";

const picker = document.querySelector(".game-picker");
const choices = [...picker.querySelectorAll("[data-game]")];
let selected;

picker.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-game]");
  if (!choice) return;

  if (selected && selected !== choice) {
    const previous = document.getElementById(selected.dataset.game);
    previous.dispatchEvent(new Event("arcade:deselect"));
    previous.hidden = true;
    selected.setAttribute("aria-expanded", "false");
  }
  const selectionChanged = selected !== choice;
  selected = choice;
  const panel = document.getElementById(choice.dataset.game);
  panel.hidden = false;
  choice.setAttribute("aria-expanded", "true");
  document.getElementById(panel.getAttribute("aria-labelledby")).focus();
  if (selectionChanged) window.umami?.track("arcade_game_opened", { game: choice.dataset.game });
});

const pairSprites = [
  { name: "срце", pixels: ["##.##", "#####", "#####", ".###.", "..#.."] },
  { name: "печурка", pixels: [".###.", "#####", "##.##", "..#..", ".###."] },
  { name: "круна", pixels: ["#.#.#", "#####", ".###.", ".###.", "....."] },
  { name: "цвет", pixels: ["..#..", ".###.", "##.##", ".###.", "..#.."] },
  { name: "ѕвезда", pixels: ["..#..", "#####", ".###.", ".#.#.", "#...#"] },
  { name: "облак", pixels: [".....", "..##.", ".####", "#####", ".###."] }
];

function pixelIcon(pixels) {
  const canvas = document.createElement("canvas");
  canvas.className = "pixel-icon";
  canvas.width = canvas.height = 5;
  canvas.setAttribute("aria-hidden", "true");
  const context = canvas.getContext("2d");
  context.fillStyle = "#285b36";
  pixels.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      if (pixel === "#") context.fillRect(x, y, 1, 1);
    });
  });
  return canvas;
}

function shuffled(items) {
  const deck = [...items];
  for (let end = deck.length - 1; end > 0; end -= 1) {
    const draw = Math.floor(Math.random() * (end + 1));
    [deck[end], deck[draw]] = [deck[draw], deck[end]];
  }
  return deck;
}

function setupPairs() {
  const board = document.querySelector("#pairs-board");
  const counter = document.querySelector("#pair-count");
  const message = document.querySelector("#pairs-message");
  let first;
  let pending;
  let attempts;
  let matched;

  function hide(card) {
    card.button.textContent = "?";
    card.button.setAttribute("aria-label", `Картичка ${card.number}, скриена`);
    delete card.button.dataset.face;
  }

  function flip(card) {
    if (pending !== undefined || first === card || card.matched) return;
    card.button.replaceChildren(pixelIcon(card.sprite.pixels));
    card.button.dataset.face = "up";
    card.button.setAttribute("aria-label", `Картичка ${card.number}, ${card.sprite.name}`);

    if (!first) {
      first = card;
      message.textContent = "Преврти уште една картичка.";
      return;
    }

    counter.textContent = String(++attempts);
    const previous = first;
    first = undefined;
    if (card.sprite === previous.sprite) {
      for (const pair of [previous, card]) {
        pair.matched = true;
        pair.button.dataset.face = "matched";
        pair.button.setAttribute("aria-disabled", "true");
        pair.button.setAttribute("aria-label", `Картичка ${pair.number}, ${pair.sprite.name}, спарена`);
      }
      matched += 1;
      message.textContent = matched === pairSprites.length
        ? `Ги пронајде сите шест пара! Обиди: ${attempts}.`
        : `Пронајдени парови: ${matched} од 6.`;
      return;
    }

    message.textContent = `Нема пар: ${previous.sprite.name} и ${card.sprite.name}.`;
    pending = setTimeout(() => {
      hide(previous);
      hide(card);
      pending = undefined;
    }, 900);
  }

  function reset() {
    clearTimeout(pending);
    first = pending = undefined;
    attempts = matched = 0;
    counter.textContent = "0";
    message.textContent = "Преврти две картички и пронајди ги сите шест пара.";
    const buttons = shuffled([...pairSprites, ...pairSprites]).map((sprite, index) => {
      const button = document.createElement("button");
      button.type = "button";
      const card = { button, sprite, number: index + 1, matched: false };
      hide(card);
      button.addEventListener("click", () => flip(card));
      return button;
    });
    board.replaceChildren(...buttons);
  }

  document.querySelector("#pairs-reset").addEventListener("click", () => {
    reset();
    board.firstElementChild.focus();
  });
  reset();
}

const trails = [
  ["S.*~~", "~~.~~", "*...~", "~~~.~", "~~~.F"],
  ["S.~*.", "~.~..", "~...~", "~.~~~", "*...F"],
  ["S..~*", "~~.~.", "*....", ".~~~.", "..*.F"]
];
const directions = {
  ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1]
};

function setupTrail() {
  const board = document.querySelector("#trail-board");
  const counter = document.querySelector("#trail-level");
  const message = document.querySelector("#trail-message");
  const next = document.querySelector("#trail-next");
  let stage = 0;
  let position;
  let flies;
  let finish;
  let won;
  let tiles;

  function render() {
    for (const [index, tile] of tiles) {
      const current = index === position;
      const contents = current ? "frog" : flies.has(index) ? "fly" : index === finish ? "flag" : "leaf";
      const labels = { frog: "Жаба", fly: "Светулка", flag: "Знаме", leaf: "Лист" };
      tile.dataset.tile = contents;
      tile.tabIndex = current ? 0 : -1;
      tile.setAttribute("aria-label", `${labels[contents]}, ред ${Math.floor(index / 5) + 1}, колона ${index % 5 + 1}`);
    }
  }

  function move(index) {
    if (won) return;
    const rowDistance = Math.abs(Math.floor(position / 5) - Math.floor(index / 5));
    const columnDistance = Math.abs(position % 5 - index % 5);
    if (!tiles.has(index) || rowDistance + columnDistance !== 1) {
      message.textContent = "Скокни на соседен лист.";
      tiles.get(position).focus({ preventScroll: true });
      return;
    }
    position = index;
    flies.delete(index);
    render();
    tiles.get(position).focus({ preventScroll: true });
    if (position === finish && flies.size === 0) {
      won = true;
      const complete = stage === trails.length - 1;
      message.textContent = complete ? "Браво! Ги помина сите патеки." : "Патеката е завршена!";
      next.textContent = complete ? "Играј повторно" : "Следно ниво";
      next.hidden = false;
      return;
    }
    message.textContent = flies.size ? `Преостанати светулки: ${flies.size}.` : "Сега стигни до знамето.";
  }

  function load() {
    const layout = [...trails[stage].join("")];
    position = layout.indexOf("S");
    finish = layout.indexOf("F");
    flies = new Set();
    tiles = new Map();
    won = false;
    const cells = layout.map((type, index) => {
      if (type === "~") {
        const water = document.createElement("span");
        water.className = "water";
        water.setAttribute("aria-hidden", "true");
        return water;
      }
      if (type === "*") flies.add(index);
      const tile = document.createElement("button");
      tile.type = "button";
      tile.addEventListener("click", () => { if (position !== index) move(index); });
      tiles.set(index, tile);
      return tile;
    });
    board.replaceChildren(...cells);
    counter.textContent = `${stage + 1} / ${trails.length}`;
    message.textContent = `Преостанати светулки: ${flies.size}.`;
    next.hidden = true;
    render();
  }

  board.addEventListener("keydown", (event) => {
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const row = Math.floor(position / 5) + direction[0];
    const column = position % 5 + direction[1];
    if (column >= 0 && column < 5) move(row * 5 + column);
  });
  document.querySelector("#trail-reset").addEventListener("click", () => {
    load();
    tiles.get(position).focus({ preventScroll: true });
  });
  next.addEventListener("click", () => {
    stage = (stage + 1) % trails.length;
    load();
    tiles.get(position).focus({ preventScroll: true });
  });
  load();
}

setupPairs();
setupTrail();
for (const choice of choices) choice.hidden = false;
if (["#frog", "#space"].includes(window.location.hash)) choices.find((choice) => choice.dataset.game === "frog")?.click();
