(() => {
  "use strict";
  const { routes, url, element, read, write, theme, achievements } = Kodiraj;
  const output = document.querySelector("#terminal-output");
  const form = document.querySelector("#terminal-form");
  const input = document.querySelector("#command");
  const historyKey = "kodiraj.terminal.history.v2";
  const saved = read(historyKey, []);
  const commands = Array.isArray(saved) ? saved.filter((item) => typeof item === "string").slice(-50) : [];
  const names = ["help", "ls", "cd", "whoami", "sudo", "frog", "challenge", "quiz", "random", "joke", "theme", "history", "clear", "exit"];
  const aliases = { "/": "home", "..": "home", "index.html": "home", "games.html": "games", challenge: "challenges", "c++": "cpp" };
  let cursor = commands.length;
  let draft = "";
  let lastCompletion = "";
  input.maxLength = 160;

  function print(...parts) {
    const line = element("p");
    line.append(...parts);
    output.append(line);
    while (output.children.length > 100) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
  }
  function go(key) { window.location.assign(url(key)); }
  const routesList = Object.values(routes).map(([, path]) => "/" + path).join("  ");
  const demos = {
    help: () => print(names.join(", ") + "\nПример: cd /python/ · theme"),
    ls: () => print(routesList),
    cd: (argument) => {
      if (!argument) { print("Наведи страница. Пример: cd /python/"); return; }
      const key = Object.hasOwn(aliases, argument) ? aliases[argument] : argument.replace(/^\/+|\/+$/g, "");
      if (Object.hasOwn(routes, key)) go(key);
      else print("Непозната патека. Напиши ls за достапните страници.");
    },
    whoami: () => print("гостин на kodiraj.mk · учиш со свое темпо"),
    sudo: () => print("Оваа симулација нема администраторски дозволи."),
    frog: () => window.location.assign(url("games") + "#frog"),
    challenge: () => go("challenges"),
    quiz: () => go("quiz"),
    random: () => {
      const destinations = ["python", "cpp", "ai", "cybersecurity", "web", "sql", "games", "quiz", "challenges"];
      go(destinations[Math.floor(Math.random() * destinations.length)]);
    },
    joke: () => print("Зошто жабата го прочита кодот двапати? Првиот пат ги прескокна баговите."),
    theme: (argument) => {
      if (!argument) { print("Тековна тема: " + document.documentElement.dataset.theme + " · theme light ја враќа светлата тема."); return; }
      if (!["light", "retro"].includes(argument)) { print("Непозната тема. Напиши theme за помош."); return; }
      print("Тема: " + theme(argument));
    },
    history: () => print(commands.map((command, index) => (index + 1) + "  " + command).join("\n")),
    clear: () => output.replaceChildren(),
    exit: () => go("home"),
    achievements: () => {
      const discovered = KodirajSecrets.catalog.filter(({ id }) => KodirajSecrets.has(id)).map(({ name }) => name);
      print([...achievements(), ...discovered].join(" · ") || "Сè уште нема отклучени достигнувања.");
    }
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const commandLine = input.value.trim();
    if (!commandLine) return;
    commands.push(commandLine);
    if (commands.length > 50) commands.shift();
    write(historyKey, commands);
    cursor = commands.length;
    lastCompletion = draft = input.value = "";
    const [name, ...args] = commandLine.toLowerCase().split(/\s+/);
    const normalized = [name, ...args].join(" ");
    print("› " + commandLine);
    const showMenuHint = KodirajSecretTerminal.count();
    if (!KodirajSecretTerminal.run(normalized, print)) {
      if (Object.hasOwn(demos, name)) demos[name](args.join(" "));
      else print("Непозната команда. Напиши help.");
    }
    if (showMenuHint) print("You know you can use the menu, right?");
    if (!document.activeElement.closest(".bug-panel")) input.focus({ preventScroll: true });
  });
  input.addEventListener("input", () => { lastCompletion = ""; });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      if (cursor === commands.length) draft = input.value;
      cursor = Math.max(0, Math.min(commands.length, cursor + (event.key === "ArrowUp" ? -1 : 1)));
      input.value = commands[cursor] ?? draft;
    } else if (event.key === "Tab" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      const text = input.value.toLowerCase();
      if (!text.trim()) return;
      const candidates = text.startsWith("cd ")
        ? Object.values(routes).map(([, path]) => "cd /" + path)
        : names;
      const matches = candidates.filter((name) => name.startsWith(text));
      if (!matches.length || matches.includes(text) || lastCompletion === text) return;
      event.preventDefault();
      if (matches.length === 1) input.value = matches[0];
      else {
        lastCompletion = text;
        print(matches.join("  "));
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      output.focus();
    }
  });
  print("kodiraj.mk · фиктивна сесија\nНапиши help за достапните команди.");
})();
