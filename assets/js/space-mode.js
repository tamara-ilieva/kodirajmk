(() => {
  "use strict";
  const game = document.querySelector("#frog");
  const { element } = Kodiraj;
  const { grant, has, icon } = KodirajSecrets;
  let mode = "classic";
  const switcher = element("button", "Frog in Space", "arcade-button space-switch");
  switcher.type = "button";
  switcher.hidden = !has("space");
  switcher.addEventListener("click", () => select(mode === "space" ? "classic" : "space"));
  game.querySelector(".game-actions").append(switcher);
  function select(nextMode) {
    mode = nextMode;
    switcher.textContent = mode === "space" ? "Класичен Frog Jump" : "Frog in Space";
    KodirajEggs.emit("frog-mode", mode);
  }
  if (document.body.dataset.page === "home") {
    const star = element("button", undefined, "space-star");
    star.type = "button";
    star.setAttribute("aria-label", "Мала пикселска ѕвезда");
    star.append(icon("star"));
    star.addEventListener("click", () => {
      grant("space");
      switcher.hidden = false;
      select("space");
    });
    game.querySelector(".game-header").append(star);
  }
  if (location.hash === "#space" && has("space")) select("space");
})();
