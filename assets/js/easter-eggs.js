(() => {
  "use strict";
  const { element, base, read, write } = Kodiraj;
  const { grant, has, icon } = KodirajSecrets;
  const home = document.body.dataset.page === "home";
  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let sequence = 0;
  let typed = "";
  let mascot;
  let notice;
  let noticeTimer;
  let mascotTimer;
  let idleTimer;
  let bugPanel;
  let frogPresses = 0;
  const sessionCounts = {};
  const emit = (type, detail) => document.dispatchEvent(new CustomEvent("kodiraj:" + type, { detail }));

  function announce(text) {
    if (!notice) {
      notice = element("p", undefined, "secret-message");
      notice.setAttribute("role", "status");
      notice.lang = "en";
      document.body.append(notice);
    }
    notice.textContent = text;
    notice.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { notice.hidden = true; }, 5000);
  }
  function pressFrog() {
    if (++frogPresses % 10) return;
    const bubble = element("span", "I'm a developer, not a button.", "secret-speech");
    bubble.setAttribute("role", "status");
    bubble.lang = "en";
    addMascot().after(bubble);
    setTimeout(() => bubble.remove(), 5000);
    grant("personal");
  }
  function addMascot() {
    if (mascot) return mascot;
    const nest = element("div", undefined, "secret-nest");
    mascot = element("button", undefined, "secret-mascot");
    mascot.type = "button";
    mascot.setAttribute("aria-label", "Пикселска жаба");
    mascot.title = "Пикселска жаба · задржи за стариот монитор";
    const image = element("img");
    image.src = new URL("favicon.svg", base);
    image.alt = "";
    mascot.append(image, element("span", "ZZZ", "secret-zzz"));
    nest.append(mascot);
    (document.querySelector(".footer") ?? document.body).append(nest);
    let hold;
    let held = false;
    const cancelHold = () => clearTimeout(hold);
    mascot.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      held = false;
      hold = setTimeout(() => { held = true; KodirajThemes.retro(); }, 850);
    });
    for (const type of ["pointerup", "pointercancel", "pointerleave"]) mascot.addEventListener(type, cancelHold);
    mascot.addEventListener("contextmenu", (event) => event.preventDefault());
    mascot.addEventListener("click", () => {
      if (!held) pressFrog();
      held = false;
    });
    return mascot;
  }
  function animateMascot(animation) {
    addMascot();
    clearTimeout(mascotTimer);
    mascot.dataset.effect = animation;
    const frogs = [...document.querySelectorAll(".secret-mascot, .frog-404, .room-frog")];
    if (animation === "hop") for (const frog of frogs) frog.classList.add("frog-hop");
    mascotTimer = setTimeout(() => {
      delete mascot.dataset.effect;
      for (const frog of frogs) frog.classList.remove("frog-hop");
    }, 1000);
  }
  function whisper() {
    animateMascot("hop");
    grant("whisper");
  }
  function floatFrog() {
    animateMascot("float");
    mascot.scrollIntoView({ block: "nearest" });
    grant("gravity");
  }
  function counter(key) {
    const name = "kodiraj.secrets." + key;
    const stored = read(name, 0);
    const value = Math.max(sessionCounts[key] ?? 0, Number.isSafeInteger(stored) ? stored : 0) + 1;
    sessionCounts[key] = value;
    write(name, value);
    return value;
  }
  function showBugs() {
    if (bugPanel) { bugPanel.querySelector("button").focus(); return; }
    const previous = document.activeElement;
    const panel = bugPanel = element("section", undefined, "bug-panel");
    panel.setAttribute("aria-label", "Bug Infestation");
    const close = element("button", "Откажи", "arcade-button");
    close.type = "button";
    const tally = element("p", "Bugs fixed: 0/10");
    tally.setAttribute("role", "status");
    const swarm = element("div", undefined, "bug-swarm");
    const finish = () => { panel.remove(); bugPanel = undefined; if (previous?.isConnected) previous.focus(); };
    close.addEventListener("click", finish);
    panel.addEventListener("keydown", (event) => { if (event.key === "Escape") finish(); });
    let caught = 0;
    for (let i = 0; i < 10; i += 1) {
      const bug = element("button", undefined, "pixel-bug");
      bug.type = "button";
      bug.setAttribute("aria-label", "Фати бубачка " + (i + 1));
      bug.style.setProperty("--bug-delay", -i * .34 + "s");
      bug.append(icon("bug"));
      bug.addEventListener("click", () => {
        const next = bug.nextElementSibling ?? bug.previousElementSibling ?? close;
        bug.remove();
        caught += 1;
        tally.textContent = "Bugs fixed: " + caught + "/10";
        if (caught === 10) {
          announce("All bugs fixed. For now...");
          grant("hunter");
          finish();
        } else next.focus({ preventScroll: true });
      });
      swarm.append(bug);
    }
    const target = document.querySelector("main");
    panel.append(tally, swarm, close);
    target.append(panel);
    panel.scrollIntoView({ block: "nearest" });
    swarm.firstElementChild.focus({ preventScroll: true });
  }
  function python() {
    if (!home) return;
    addMascot().classList.add("snake-mascot");
    if (!mascot.querySelector("canvas")) mascot.prepend(icon("snake"));
    grant("python");
    const snakePanel = document.querySelector("#snake-game");
    if (snakePanel) snakePanel.hidden = false;
    return Boolean(snakePanel);
  }
  function idle() {
    clearTimeout(idleTimer);
    mascot?.classList.remove("frog-asleep");
    if (document.hidden) return;
    idleTimer = setTimeout(() => {
      addMascot().classList.add("frog-asleep");
      grant("afk");
    }, 120000);
  }
  if (home) {
    addMascot();
    for (const event of ["pointermove", "pointerdown", "keydown", "click", "scroll", "touchstart"]) {
      window.addEventListener(event, idle, { passive: true });
    }
    document.addEventListener("visibilitychange", idle);
    idle();
  }
  if (has("python") && home) {
    python();
    if (location.hash === "#snake-game") document.querySelector("#snake-game").scrollIntoView();
  }
  document.addEventListener("kodiraj:secret-message", (event) => announce(event.detail));
  document.addEventListener("kodiraj:frog-press", pressFrog);
  document.addEventListener("kodiraj:frog-start", (event) => { if (event.detail.night) grant("night"); });
  document.addEventListener("kodiraj:frog-collision", (event) => {
    if (event.detail.first && !has("professional") && counter("firstHits") >= 5) {
      announce("Skill issue detected.");
      grant("professional");
    }
  });
  document.addEventListener("kodiraj:theme", () => {
    if (document.documentElement.dataset.theme === "retro") grant("retro");
  });
  let previousKeysAt = 0;
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey
      || event.target.closest?.("input, textarea, select, button, a, summary, [contenteditable], .game, .terminal, .snake-game, .bug-panel")) {
      sequence = 0;
      typed = "";
      return;
    }
    if (Date.now() - previousKeysAt > 5500) { sequence = 0; typed = ""; }
    previousKeysAt = Date.now();
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    sequence = key === konami[sequence] ? sequence + 1 : key === "ArrowUp" ? Math.min(sequence + 1, sequence === 2 ? 2 : 1) : 0;
    if (sequence === konami.length) { sequence = 0; KodirajThemes.retro(); }
    typed = /^[a-z]$/.test(key) ? (typed + key).slice(-6) : "";
    if (typed.endsWith("ribbit")) whisper();
    if (typed.endsWith("matrix")) { addMascot(); KodirajThemes.matrix(true); }
    if (typed.endsWith("debug")) showBugs();
    if (typed.endsWith("python")) python();
  });
  window.KodirajEggs = { announce, counter, floatFrog, whisper, showBugs, python, addMascot, emit };
  console.info("Oh, you're inspecting our code? We like you already.");
  console.info("Curiosity is a developer's superpower.");
  console.info("Developer room: " + new URL("secret/", base).href + " · Clue 1: PIXEL");
})();
