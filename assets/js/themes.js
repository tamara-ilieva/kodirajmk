(() => {
  "use strict";
  const { element, theme } = Kodiraj;
  const { grant } = KodirajSecrets;
  let rain;
  let matrixButton;
  let retroButton;
  function syncRetro() {
    if (!retroButton) {
      retroButton = element("button", "Излези од ретро режим", "arcade-button theme-exit");
      retroButton.type = "button";
      retroButton.addEventListener("click", () => {
        theme("light");
        document.querySelector(".site-nav a")?.focus({ preventScroll: true });
      });
      document.querySelector(".footer")?.append(retroButton);
    }
    retroButton.hidden = document.documentElement.dataset.theme !== "retro";
  }
  function retro() {
    theme("retro");
    grant("retro");
    document.dispatchEvent(new CustomEvent("kodiraj:secret-message", { detail: "RETRO MODE UNLOCKED" }));
  }
  function matrix(active = !rain) {
    if (active === Boolean(rain)) return;
    document.documentElement.classList.toggle("matrix-mode", active);
    document.dispatchEvent(new Event("kodiraj:matrix"));
    if (!active) {
      rain.remove();
      matrixButton.remove();
      rain = matrixButton = undefined;
      document.querySelector("#command, .site-nav a")?.focus({ preventScroll: true });
      return;
    }
    rain = element("div", undefined, "matrix-rain");
    rain.setAttribute("aria-hidden", "true");
    document.documentElement.classList.toggle("secret-tab-hidden", document.hidden);
    for (let i = 0; i < 18; i += 1) {
      const bits = Array.from({ length: 24 }, (_, bit) => (i * 7 + bit * (i + 1)) % 3 ? "1" : "0");
      const line = element("span", bits.join("\n"));
      line.style.setProperty("--fall-time", (9 + i % 6) + "s");
      line.style.setProperty("--delay", -(i * 2 % 13) + "s");
      rain.append(line);
    }
    matrixButton = element("button", "Исклучи Matrix", "arcade-button matrix-exit");
    matrixButton.type = "button";
    matrixButton.addEventListener("click", () => matrix(false));
    document.body.prepend(rain);
    const navigation = document.querySelector("[data-site-nav]");
    if (navigation) navigation.after(matrixButton);
    else document.body.append(matrixButton);
    grant("matrix");
    document.dispatchEvent(new CustomEvent("kodiraj:secret-message", { detail: "Wake up, developer..." }));
  }
  document.addEventListener("kodiraj:theme", syncRetro);
  document.addEventListener("keydown", (event) => {
    if (rain && event.key === "Escape" && !event.defaultPrevented
      && !event.target.closest?.("input, textarea, select, [contenteditable], .game, .snake-game, .bug-panel, .terminal")) matrix(false);
  });
  document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("secret-tab-hidden", document.hidden);
  });
  window.KodirajThemes = { retro, matrix };
  syncRetro();
})();
