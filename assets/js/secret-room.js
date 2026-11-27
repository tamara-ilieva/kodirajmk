(() => {
  "use strict";
  const { base, element, read, write, url } = Kodiraj;
  const { grant, has } = KodirajSecrets;
  const gate = document.querySelector("#room-gate");
  const room = document.querySelector("#developer-room");
  const form = gate.querySelector("form");
  const input = form.querySelector("input");
  const message = gate.querySelector("[role='status']");
  const links = room.querySelector("#room-games");
  const touch = document.querySelector("#room-touch");
  const key = "kodiraj.secrets.room";
  const parts = ["pixel", "frog", "hops"];
  function games() {
    links.replaceChildren();
    const destinations = [
      ["python", "Snake", new URL("./#snake-game", base)],
      ["space", "Frog in Space", url("games") + "#space"]
    ];
    for (const [id, name, href] of destinations) {
      if (!has(id)) continue;
      const link = element("a", name);
      link.href = href;
      const item = element("li");
      item.append(link);
      links.append(item);
    }
    if (!links.children.length) links.append(element("li", "Овде ќе се појават игрите што ќе ги откриеш."));
    touch.hidden = has("python");
  }
  function open(focus = false) {
    gate.hidden = true;
    room.hidden = false;
    games();
    if (focus) room.querySelector("h2").focus();
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const guess = input.value.toLowerCase().trim().replace(/[\s-]+/g, " ");
    if (guess === parts[0]) {
      grant("curious");
      message.textContent = "Првиот збор е точен. Најди ги и другите два.";
      return;
    }
    if (guess !== parts.join(" ")) {
      message.textContent = "Вратата сè уште е затворена. Пробај ги зборовите по редоследот на трагите.";
      return;
    }
    grant("curious");
    grant("explorer");
    write(key, true);
    open(true);
  });
  document.addEventListener("kodiraj:awards", games);
  if (read(key, false) || has("explorer")) open();
  touch.addEventListener("click", () => {
    grant("python");
    window.location.assign(new URL("./#snake-game", base));
  });
  document.querySelector("#room-ribbit").addEventListener("click", KodirajEggs.whisper);
  document.querySelector("#room-bugs").addEventListener("click", KodirajEggs.showBugs);
  document.querySelector("#room-matrix").addEventListener("click", () => {
    KodirajEggs.addMascot();
    KodirajThemes.matrix(true);
  });
})();
