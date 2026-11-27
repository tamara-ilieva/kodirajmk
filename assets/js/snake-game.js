(() => {
  "use strict";
  const host = document.querySelector("#snake-game");
  const { read, write, element } = Kodiraj;
  const recordKey = "kodiraj.secrets.snake.best";
  const columns = 16, rows = 12, cell = 12;
  const arrows = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  const canvas = host.querySelector("canvas");
  const context = canvas.getContext("2d");
  const play = host.querySelector("[data-snake-play]");
  const stats = host.querySelector("[data-snake-score]");
  const status = host.querySelector("[data-snake-status]");
  let best = Math.max(0, Number(read(recordKey, 0)) || 0);
  let body, food, direction, queued, running, timer, score;
  function draw() {
    const dark = document.documentElement.dataset.theme === "retro";
    context.fillStyle = dark ? "#1b231c" : "#f2f5ed";
    context.fillRect(0, 0, canvas.width, canvas.height);
    body.forEach(([x, y], index) => {
      context.fillStyle = index ? "#659451" : dark ? "#c5ed9f" : "#285b36";
      context.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
    });
    if (food) {
      context.fillStyle = dark ? "#c5ed9f" : "#252922";
      context.fillRect(food[0] * cell + 4, food[1] * cell + 4, 4, 4);
    }
    stats.textContent = "Поени: " + score + " · Рекорд: " + best;
  }
  const equal = (a, b) => a[0] === b[0] && a[1] === b[1];
  function placeFood() {
    const empty = [];
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        if (!body.some((point) => equal(point, [x, y]))) empty.push([x, y]);
      }
    }
    return empty[Math.floor(Math.random() * empty.length)];
  }
  function stop(message) {
    running = false;
    clearTimeout(timer);
    play.textContent = "Играј повторно";
    status.textContent = message;
  }
  function step() {
    if (!running || document.hidden) return;
    direction = queued ?? direction;
    queued = undefined;
    const head = [body[0][0] + direction[0], body[0][1] + direction[1]];
    const [x, y] = head;
    const eats = food && equal(head, food);
    const occupied = eats ? body : body.slice(0, -1);
    if (x < 0 || x >= columns || y < 0 || y >= rows || occupied.some((point) => equal(point, head))) {
      stop("Крај на играта. Пробај повторно!");
      return;
    }
    body.unshift(head);
    if (eats) {
      score += 1;
      best = Math.max(best, score, Number(read(recordKey, 0)) || 0);
      write(recordKey, best);
      food = placeFood();
      if (!food) stop("Ја освои целата табла!");
    } else body.pop();
    draw();
    if (running) timer = setTimeout(step, Math.max(75, 160 - score * 4));
  }
  function reset() {
    clearTimeout(timer);
    body = [[5, 5], [4, 5], [3, 5]];
    food = [8, 5];
    direction = arrows.ArrowRight;
    queued = undefined;
    score = 0;
    draw();
  }
  function steer(key) {
    const vector = arrows[key];
    if (!running || queued || !vector || (vector[0] === -direction[0] && vector[1] === -direction[1])) return;
    queued = vector;
  }
  play.addEventListener("click", () => {
    reset();
    running = true;
    play.textContent = "Почни одново";
    status.textContent = "Собирај ги точките.";
    canvas.focus({ preventScroll: true });
    timer = setTimeout(step, 160);
  });
  host.addEventListener("keydown", (event) => {
    if (Object.hasOwn(arrows, event.key) && (running || event.target === canvas)) {
      event.preventDefault();
      steer(event.key);
    }
  });
  for (const button of host.querySelectorAll("[data-snake-direction]")) {
    button.addEventListener("click", () => steer(button.dataset.snakeDirection));
  }
  document.addEventListener("visibilitychange", () => {
    clearTimeout(timer);
    if (running && !document.hidden) timer = setTimeout(step, 160);
  });
  document.addEventListener("kodiraj:theme", draw);
  reset();
})();
