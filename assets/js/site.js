(() => {
  "use strict";

  const base = new URL("../../", document.currentScript.src);
  const routes = {
    home: ["Почетна", ""], python: ["Python", "python/"], cpp: ["C++", "cpp/"],
    ai: ["AI / ML", "ai/"], cybersecurity: ["Сајбербезбедност", "cybersecurity/"],
    web: ["Web", "web/"], sql: ["SQL", "sql/"], games: ["Мини игри", "games.html"],
    terminal: ["Терминал", "terminal/"], quiz: ["Квиз", "quiz/"],
    challenges: ["Дневен предизвик", "challenges/"]
  };
  const url = (key) => new URL(routes[key][1], base).href;
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage can be disabled. */ }
  }
  function element(tag, content, className) {
    const node = document.createElement(tag);
    if (content !== undefined) node.textContent = content;
    if (className) node.className = className;
    return node;
  }
  const achievementNames = {
    logo: "Пет пиксели", konami: "Ретро комбинација", python: "Поздрав, Python!",
    debug: "Ловец на багови", retro: "Зелен монитор", crown: "Крунисана жаба",
    terminal: "Таен терминал", lost: "Изгубен пиксел", quiz: "Програмерски профил",
    daily: "Дневен предизвик"
  };
  let unlocked = read("kodiraj.achievements.v2", []);
  if (!Array.isArray(unlocked)) unlocked = [];
  let noticeTimer;
  function unlock(id) {
    const stored = read("kodiraj.achievements.v2", []);
    if (Array.isArray(stored)) unlocked = [...new Set([...stored, ...unlocked])];
    if (!achievementNames[id] || unlocked.includes(id)) return false;
    unlocked.push(id);
    write("kodiraj.achievements.v2", unlocked);
    const notice = document.querySelector("#achievement-toast");
    notice.textContent = "Отклучено: " + achievementNames[id];
    notice.hidden = false;
    document.dispatchEvent(new Event("kodiraj:legacy-award"));
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { notice.hidden = true; }, 4200);
    return true;
  }
  function theme(name) {
    const value = name === "retro" ? "retro" : "light";
    document.documentElement.dataset.theme = value;
    write("kodiraj.theme.v2", value);
    document.dispatchEvent(new Event("kodiraj:theme"));
    return value;
  }
  function link(key) {
    const anchor = element("a", routes[key][0]);
    anchor.href = url(key);
    if (document.body.dataset.page === key) anchor.setAttribute("aria-current", "page");
    return anchor;
  }

  function init() {
    const notice = element("p", "", "achievement-toast");
    notice.id = "achievement-toast";
    notice.setAttribute("role", "status");
    notice.hidden = true;
    document.body.append(notice);
    document.documentElement.dataset.theme = read("kodiraj.theme.v2", "light") === "retro" ? "retro" : "light";
    document.dispatchEvent(new Event("kodiraj:theme"));

    const mount = document.querySelector("[data-site-nav]");
    if (mount) {
      const nav = element("nav", undefined, "site-nav");
      nav.setAttribute("aria-label", "Главна навигација");
      const courses = element("details");
      courses.append(element("summary", "Курсеви"));
      const list = element("ul");
      for (const key of ["python", "cpp", "ai", "cybersecurity", "web", "sql"]) {
        const item = element("li");
        item.append(link(key));
        list.append(item);
      }
      courses.append(list);
      nav.append(link("home"), courses, link("games"), link("terminal"), link("quiz"), link("challenges"));
      nav.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && courses.open) {
          courses.open = false;
          courses.querySelector("summary").focus();
        }
      });
      mount.replaceChildren(nav);
    }

    let clicks = 0;
    document.querySelector("[data-logo]")?.addEventListener("click", () => {
      if (++clicks === 5) unlock("logo");
    });
    if (document.body.dataset.page === "404") unlock("lost");
  }

  window.Kodiraj = { base, routes, url, read, write, element, unlock, theme, link,
    achievements: () => unlocked.map((id) => achievementNames[id]).filter(Boolean) };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
