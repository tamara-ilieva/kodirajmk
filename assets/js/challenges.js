(() => {
  "use strict";
  const { base, element, read, write, unlock } = Kodiraj;
  const host = document.querySelector("#daily-app");
  const stats = document.querySelector("#daily-stats");
  const history = document.querySelector("#daily-history");
  const storageKey = "kodiraj.daily.v2";
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Skopje", year: "numeric", month: "2-digit", day: "2-digit"
  });
  const millisecondsInDay = 86400000;
  let bank;
  let renderedDate;
  let sessionProgress = {};

  function localDate(now = new Date()) {
    const parts = Object.fromEntries(formatter.formatToParts(now).map(({ type, value }) => [type, value]));
    return parts.year + "-" + parts.month + "-" + parts.day;
  }
  const dayNumber = (date) => Date.parse(date + "T00:00:00Z") / millisecondsInDay;
  const dateAt = (day) => new Date(day * millisecondsInDay).toISOString().slice(0, 10);
  function getProgress() {
    const stored = read(storageKey, {});
    if (stored && typeof stored === "object" && !Array.isArray(stored)) sessionProgress = { ...sessionProgress, ...stored };
    return sessionProgress;
  }
  function updateHistory(progress, today) {
    let day = dayNumber(today) - Number(!progress[today]);
    let streak = 0;
    while (progress[dateAt(day--)]) streak += 1;
    stats.textContent = today + " · Низа: " + streak + (streak === 1 ? " ден" : " дена");
    const rows = Object.keys(progress).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort().reverse();
    history.replaceChildren(...(rows.length ? rows.map((date) => {
      const record = progress[date];
      const category = bank.find(({ id }) => id === record?.id)?.category ?? "Предизвик";
      return element("li", date + " · " + category + " · " + (record?.correct ? "Точно" : "Завршено"));
    }) : [element("li", "Сè уште нема завршени предизвици.")]));
  }
  function render() {
    const today = renderedDate = localDate();
    const progress = getProgress();
    const previous = progress[today];
    const day = dayNumber(today);
    const challenge = bank.find(({ id }) => id === previous?.id) ?? bank[((day % bank.length) + bank.length) % bank.length];
    const title = element("h2", challenge.category + " · " + challenge.difficulty);
    const form = element("form");
    const field = element("fieldset");
    field.append(element("legend", challenge.question));
    const snippet = element("pre", undefined, "code");
    snippet.append(element("code", challenge.code));
    const choices = element("div", undefined, "challenge-options");
    challenge.options.forEach((option, index) => {
      const label = element("label", undefined, "answer-option");
      const input = element("input");
      input.type = "radio";
      input.name = "answer";
      input.value = String(index);
      input.required = true;
      input.checked = previous?.id === challenge.id && previous.answer === index;
      label.append(input, element("span", option));
      choices.append(label);
    });
    field.append(snippet, choices);
    field.disabled = Boolean(previous);
    const hint = element("details");
    hint.append(element("summary", "Мала помош"), element("p", challenge.hint));
    const feedback = element("div", undefined, "preview-result");
    feedback.setAttribute("role", "status");
    function show(record) {
      if (record.id !== challenge.id) {
        feedback.replaceChildren(element("p", "Денешниот предизвик веќе е завршен."));
        return;
      }
      feedback.replaceChildren(
        element("p", record.correct ? "Точно!" : "Обидот е зачуван."),
        element("p", "Точен одговор: " + challenge.options[challenge.correct]),
        element("p", challenge.explanation)
      );
    }
    const submit = element("button", "Провери одговор", "arcade-button");
    submit.hidden = Boolean(previous);
    const actions = element("div", undefined, "control-row");
    actions.append(submit);
    form.append(field, hint, actions);
    if (previous) show(previous);
    else feedback.hidden = true;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (localDate() !== today || getProgress()[today]) { render(); return; }
      const answer = Number(new FormData(form).get("answer"));
      const record = { id: challenge.id, answer, correct: answer === challenge.correct };
      sessionProgress[today] = record;
      write(storageKey, sessionProgress);
      feedback.hidden = false;
      show(record);
      field.disabled = true;
      submit.hidden = true;
      feedback.tabIndex = -1;
      feedback.focus();
      updateHistory(sessionProgress, today);
      unlock("daily");
    });
    host.replaceChildren(title, form, feedback);
    updateHistory(progress, today);
  }
  async function load() {
    try {
      const response = await fetch(new URL("assets/data/challenges.json?v=2.0.2", base));
      if (!response.ok) throw new Error("Challenge bank unavailable");
      bank = await response.json();
      if (!Array.isArray(bank) || !bank.length) throw new Error("Empty challenge bank");
      render();
    } catch {
      const retry = element("button", "Обиди се повторно", "arcade-button");
      retry.addEventListener("click", load);
      host.replaceChildren(element("p", "Задачата не се вчита. За локален преглед, отвори ја страницата преку HTTP."), retry);
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && bank && localDate() !== renderedDate) render();
  });
  window.addEventListener("storage", (event) => {
    if (bank && event.key === storageKey) render();
  });
  load();
})();
