(() => {
  "use strict";
  const { read, write, element, base } = Kodiraj;
  const key = "kodiraj.secrets.achievements";
  const catalog = window.KodirajAwards;
  const patterns = {
    frog: ["#.#.#", "#####", "##.##", "#####", "#...#"],
    crown: ["#.#.#", "#####", "#####", ".###.", "....."],
    bug: ["#...#", ".###.", "##.##", ".###.", "#...#"],
    moon: ["..##.", ".##..", "##...", "###..", ".###."],
    cup: [".#.#.", ".....", "####.", "#.###", ".###."],
    sandwich: [".###.", "#####", ".....", "#####", "#####"],
    terminal: ["#....", ".#...", "#....", "..###", "....."],
    screen: ["#####", "#...#", "#.#.#", "#####", "..#.."],
    snake: ["..###", "..#.#", "###..", "#....", "####."],
    star: ["..#..", "#####", ".###.", ".#.#.", "#...#"],
    key: [".##..", "#..#.", ".##..", "..###", "..#.#"]
  };
  let state = {};
  let toast;
  let timer;
  const legacy = read("kodiraj.achievements.v2", []);
  function refresh() {
    const stored = read(key, {});
    for (const award of catalog) {
      const timestamp = stored?.[award.id];
      if (typeof timestamp === "string" && Number.isFinite(Date.parse(timestamp))) state[award.id] ??= timestamp;
    }
  }
  function icon(name) {
    const canvas = element("canvas", undefined, "secret-pixel");
    canvas.width = canvas.height = 5;
    canvas.setAttribute("aria-hidden", "true");
    const pen = canvas.getContext("2d");
    pen.fillStyle = name === "crown" ? "#ae790e" : "#548d46";
    (patterns[name] ?? patterns.star).forEach((row, y) => {
      [...row].forEach((pixel, x) => { if (pixel === "#") pen.fillRect(x, y, 1, 1); });
    });
    return canvas;
  }
  function publish() { document.dispatchEvent(new Event("kodiraj:awards")); }
  function notify(awards) {
    if (!toast) {
      toast = element("div", undefined, "achievement-toast secret-toast");
      toast.setAttribute("role", "status");
      document.body.append(toast);
    }
    toast.replaceChildren(...awards.map((award) => {
      const line = element("div", undefined, "secret-toast-line");
      const copy = element("div");
      copy.append(element("small", "ACHIEVEMENT UNLOCKED"), element("strong", award.name), element("span", award.description));
      line.append(icon(award.icon), copy);
      return line;
    }));
    toast.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { toast.hidden = true; }, 4800);
  }
  function grant(id, silent = false) {
    refresh();
    const award = catalog.find((item) => item.id === id);
    if (!award || state[id] || id === "master") return false;
    const timestamp = new Date().toISOString();
    state[id] = timestamp;
    const unlocked = [award];
    if (!state.master && catalog.every((item) => item.id === "master" || state[item.id])) {
      state.master = timestamp;
      unlocked.push(catalog.find((item) => item.id === "master"));
    }
    write(key, state);
    if (!silent) notify(unlocked);
    publish();
    return true;
  }
  function has(id) {
    if (!state[id]) refresh();
    return Boolean(state[id]);
  }
  window.KodirajSecrets = { grant, has, icon, catalog, snapshot: () => { refresh(); return { ...state }; } };
  refresh();
  if (read("kodiraj.frog-jump.best", 0) >= 1000 || (Array.isArray(legacy) && legacy.includes("crown"))) grant("king", true);
  if (Array.isArray(legacy) && legacy.includes("konami")) grant("retro", true);
  document.addEventListener("kodiraj:frog-score", (event) => { if (event.detail >= 1000) grant("king"); });
  window.addEventListener("storage", (event) => { if (event.key === key) { refresh(); publish(); } });
  const footer = document.querySelector(".footer");
  if (footer) {
    footer.append(element("small", "Built with curiosity, caffeine and questionable sleep schedules.", "secret-credit"));
    const link = element("a", "✦", "secret-achievement-link");
    link.href = new URL("secrets/", base);
    link.setAttribute("aria-label", "Secret Achievements");
    footer.append(link);
    function reveal() {
      refresh();
      const earlier = read("kodiraj.achievements.v2", []);
      link.hidden = !Object.keys(state).length && !(Array.isArray(earlier) && earlier.some((id) => ["logo", "terminal", "lost", "konami", "crown"].includes(id)));
    }
    reveal();
    document.addEventListener("kodiraj:awards", reveal);
    document.addEventListener("kodiraj:legacy-award", reveal);
  }
  const list = document.querySelector("#secret-achievements");
  if (list) {
    function render() {
      refresh();
      const count = Object.keys(state).length;
      const progress = document.querySelector("#secret-progress");
      progress.max = catalog.length;
      progress.value = count;
      progress.setAttribute("aria-label", count + " / " + catalog.length + " unlocked");
      document.querySelector("#secret-count").textContent = count + " / " + catalog.length + " unlocked";
      const visible = catalog.filter((award) => state[award.id]).sort((a, b) => state[a.id].localeCompare(state[b.id]));
      list.replaceChildren(...visible.map((award) => {
        const item = element("li");
        const details = element("div");
        const time = element("time", new Date(state[award.id]).toLocaleDateString());
        time.dateTime = state[award.id];
        details.append(element("strong", award.name), element("p", award.description), element("small", award.rarity + " · "), time);
        item.append(icon(award.icon), details);
        return item;
      }), ...Array.from({ length: catalog.length - count }, () => {
        const item = element("li", "?");
        item.setAttribute("aria-label", "Locked achievement");
        return item;
      }));
    }
    render();
    document.addEventListener("kodiraj:awards", render);
  }
  if (["localhost", "127.0.0.1", "[::1]"].includes(location.hostname) && new URLSearchParams(location.search).get("secret-test") === "1") {
    window.KodirajSecretTest = { grant, snapshot: window.KodirajSecrets.snapshot };
  }
})();
