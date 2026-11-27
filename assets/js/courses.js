(() => {
  "use strict";
  const { element } = Kodiraj;
  const previews = {
    python: ['print("Coming soon...")', "Coming soon...", ["Python од нула", "Автоматизација со Python", "Работа со датотеки и податоци"]],
    cpp: ['std::cout << "Coming soon...";', "Coming soon...", ["Основи на C++", "Структури на податоци", "Алгоритми и сложеност"]],
    ai: ["model.fit(knowledge, curiosity)\nprediction = model.predict(future)\nprint(prediction)", "Something intelligent is coming...", ["Основи на машинско учење", "Класификација и регресија", "Оценување модели"]],
    cybersecurity: ["# Фиктивна проверка на виртуелна лабораторија\nscan demo-workstation", "Проверка на демо-поставки…\nПроверка на дозволи…\nAccess granted. Coming soon...", ["Основи на сајберхигиена", "Приватност и управување со пристап", "Препознавање фишинг и безбедносни инциденти"]],
    web: ['<main>\n  <h1>Coming soon...</h1>\n  <p>Учи. Практикувај. Создавај.</p>\n</main>', "", ["HTML и пристапност", "CSS и приспособлив распоред", "JavaScript во прелистувач"]],
    sql: ["SELECT * FROM courses WHERE status = 'coming_soon';", "course      | status\n------------+------------\nSQL основи  | coming_soon\n(1 ред)", ["Основи на SQL", "JOIN и групирање", "Моделирање релациски бази"]]
  };
  const page = document.body.dataset.page;
  const [source, output, courses] = previews[page];
  const host = document.querySelector("#course-preview");
  host.classList.add("code-preview");
  const pre = element("pre", undefined, "code");
  const code = element("code");
  const tokens = /(^#.*$|"[^"]*"|'[^']*'|<\/?[a-z][a-z0-9]*>|\b(?:SELECT|FROM|WHERE|print|model|fit|predict|std|cout|scan)\b)/gm;
  let cursor = 0;
  for (const match of source.matchAll(tokens)) {
    const [token] = match;
    code.append(source.slice(cursor, match.index));
    const style = token[0] === "#" ? "comment" : /^["']/.test(token) ? "string" : "keyword";
    code.append(element("span", token, "token-" + style));
    cursor = match.index + token.length;
  }
  code.append(source.slice(cursor));
  pre.append(code);
  const button = element("button", "Run", "arcade-button");
  button.type = "button";
  button.lang = "en";
  const result = element("div", undefined, "preview-result");
  result.setAttribute("role", "status");
  result.setAttribute("aria-atomic", "true");
  result.hidden = true;
  button.addEventListener("click", () => {
    result.hidden = false;
    result.replaceChildren(element("p", page === "web" ? "Симулиран приказ" : "Симулиран излез", "fine-print"));
    if (page === "web") result.append(element("h3", "Coming soon..."), element("p", "Учи. Практикувај. Создавај."));
    else result.append(element("pre", output, "code"));
  });
  host.append(element("h2", "Преглед на код"), pre, button, result);
  document.querySelector("#planned-courses").append(...courses.map((course) => element("li", course)));
})();
