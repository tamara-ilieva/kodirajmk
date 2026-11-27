(() => {
  "use strict";
  const { element, url, unlock } = Kodiraj;
  const profiles = {
    d: ["The Debugger", "„Кај мене работи“ ти звучи како почеток на добра мистерија. Сакаш да го најдеш оној чекор на кој сè тргнува наопаку.", "Земи кратка Python програма што дава погрешен резултат, најди внес што ја открива грешката и направи тест за него.", [["python", "Python од нула"], ["cpp", "Основи на C++"]]],
    a: ["The Architect", "Додека другите веќе пишуваат код, ти црташ на ливче како ќе се поврзат деловите. Сакаш следната промена да биде лесна.", "Замисли апликација за позајмување книги. Нацртај како се поврзани книгите, членовите и позајмиците, па претвори ги во SQL табели.", [["sql", "Моделирање релациски бази"], ["cpp", "Структури на податоци"]]],
    g: ["The Game Developer", "Едно копче и една пикселска жаба ти се доволни за да смислиш игра. Најмногу те радува кога некој ќе каже „уште еднаш“.", "Направи лик што скока, додај една пречка и дај му на другар да го проба првото ниво.", [["web", "JavaScript во прелистувач"], ["cpp", "Алгоритми и сложеност"]]],
    i: ["The AI Explorer", "Штом ќе видиш куп податоци, те копка што се крие во нив. Уште повеќе те интересира кога моделот самоуверено ќе згреши.", "Пробај мал модел за препознавање слики и разгледај ги сликите на кои најчесто греши.", [["ai", "Основи на машинско учење"], ["ai", "Оценување модели"]]],
    c: ["The Cyber Defender", "Кога апликација за светилка бара пристап до контактите, веднаш прашуваш зошто. Ти лежат приватноста, дозволите и безбедните навики.", "Провери ги дозволите на апликациите што ги користиш и избери кои имаат смисла за секоја од нив.", [["cybersecurity", "Основи на сајберхигиена"], ["cybersecurity", "Приватност и управување со пристап"]]],
    w: ["The Web Creator", "Те радува кога некој ќе отвори страница и веднаш ќе знае каде да кликне. Веќе си замислуваш како ќе изгледа и на телефон.", "Направи мала страница за омилено место, па помини низ неа на телефон и само со тастатура.", [["web", "HTML и пристапност"], ["web", "CSS и приспособлив распоред"]]],
    m: ["The Automator", "Кога по третпат ќе ја повториш истата задача, веќе замислуваш скрипта што ќе ја заврши додека пиеш чај.", "Одбери нешто што често го правиш рачно, како преименување фотографии. Испробај ја скриптата прво на копија од папката.", [["python", "Автоматизација со Python"], ["python", "Работа со датотеки и податоци"]]]
  };
  const questions = [
    ["Жабата од Frog Jump добива свој штанд на школскиот саем. Што ќе направиш за штандот?",[["g","Игра во која жабата прескокнува купишта тетратки."],["w","Веб-страница со распоред и мапа на саемот."],["m","Скрипта што ги средува пријавите додека јас си ја играм играта."]]],
    ["На списокот за екскурзија има 48 имиња, а во автобусот се само 24 ученици. Каде ќе погледнеш прво?",[["a","Во списоците од двете паралелки. Можеби сме ги споиле погрешно."],["d","Ќе проследам едно име за да видам каде се појавува вторпат."],["i","Ќе ги споредам дупликатите. Ме интересира дали имаат нешто заедничко."]]],
    ["На саемот ќе има дигитална книга за гости. Што ти е најважно пред да ја отвориш за сите?",[["c","Да провериме што ќе видат гостите и кој ќе може да ги брише пораките."],["w","Полето за порака да се најде лесно и на телефон."],["a","Пораките да се чуваат одделно за утре да можеме да го смениме изгледот."]]],
    ["Другар ти праќа папка со 300 фотографии од Маврово. Што ти паѓа на ум?",[["i","Дали модел би разликувал езеро од небо на фотографии што првпат ги гледа?"],["m","Можам да ги подредам по датум со една скрипта."],["g","Ова би било супер мапа за игра со скриени пикселски жаби."]]],
    ["Копчето „Зачувај“ работи кај тебе, а кај другар ти не. Што пробуваш?",[["d","Го повторувам неговиот редослед на чекори за да ја видам грешката."],["w","Го пробувам копчето на тесен екран, со допир и со тастатура."],["c","Проверувам дали неговата сметка има дозвола за зачувување."]]],
    ["Правите апликација што предлага по една песна за дождлив ден. Кој дел те влече најмногу?",[["a","Да ја одвојам листата со песни од правилото за избор, за лесно да ги менуваме."],["i","Да видам дали предлозите ќе се подобрат ако учиме од реакциите на луѓето."],["d","Да откријам зошто во вторник упорно ја предлага истата песна."]]],
    ["Имаш 15 минути да ги внесеш резултатите од турнирот. Што ќе ти заштеди време и следниот пат?",[["m","Ќе направам скрипта што ги собира поените од сите табели."],["a","Ќе направам една табела со јасно место за секој тим, меч и резултат."],["w","Ќе направам екран на кој резултатите се внесуваат лесно од телефон."]]],
    ["Првата верзија на играта оди кај другари на проба. Што најмногу сакаш да видиш?",[["c","Дали играта случајно бара лични податоци што воопшто не ѝ требаат."],["d","Што ќе се случи кога некој ќе притисне две копчиња одеднаш."],["g","Дали ќе посакаат уште една партија откако ќе го поминат првото ниво."]]],
    ["Правите мапа на градот за луѓе што првпат се тука. Имаш време за само една нова функција. Која?",[["w","Јасен приказ на блиските места, дури и на најмал екран."],["g","Потрага по три скриени локации со мала награда на крај."],["i","Предлози за места според тоа што посетителот сака да види."]]],
    ["Следната недела друг тим го презема твојот проект. Што ќе им оставиш?",[["a","Мала мапа на проектот за да знаат каде што се наоѓа."],["m","Една команда што им го подготвува проектот за работа."],["c","Список кој има пристап и како да пријават безбедносен проблем."]]],
    ["Семафорот во твојот симулатор вели дека во 3 наутро поминале 900 велосипеди. Што правиш?",[["i","Ги споредувам бројките со другите ноќи. Можеби има нешто интересно."],["d","Следам еден велосипед за да видам дали бројачот го брои повеќепати."],["m","Пишувам проверка што сама ќе ме извести кога ќе се појави ваква бројка."]]],
    ["Сабота, дожд, еден слободен час. Кој проект го отвораш?",[["c","Проверка кои апликации имаат пристап до мојата локација и зошто."],["g","Мала игра во која жаба собира светулки пред да се стемни."],["w","Лична страница со моите омилени места во градот."]]]
  ];
  const host = document.querySelector("#quiz-app");
  const answers = [];
  let index = 0;
  const summary = (key) => "Мојот програмерски профил е " + profiles[key][0] + " — kodiraj.mk";

  function renderQuestion(focus = false) {
    const [question, options] = questions[index];
    const form = element("form");
    const title = element("h2", "Прашање " + (index + 1) + " / " + questions.length);
    title.tabIndex = -1;
    const field = element("fieldset");
    field.append(element("legend", question));
    const box = element("div", undefined, "quiz-options");
    for (const [key, caption] of options) {
      const label = element("label", undefined, "answer-option");
      const choice = element("input");
      choice.type = "radio";
      choice.name = "profile";
      choice.value = key;
      choice.required = true;
      choice.checked = answers[index] === key;
      label.append(choice, element("span", caption));
      box.append(label);
    }
    field.append(box);
    const actions = element("div", undefined, "control-row");
    if (index > 0) {
      const back = element("button", "Назад", "arcade-button");
      back.type = "button";
      back.addEventListener("click", () => { index -= 1; renderQuestion(true); });
      actions.append(back);
    }
    actions.append(element("button", index === questions.length - 1 ? "Види резултат" : "Следно", "arcade-button"));
    form.append(title, field, actions);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      answers[index++] = new FormData(form).get("profile");
      if (index === questions.length) renderResult();
      else renderQuestion(true);
    });
    host.replaceChildren(form);
    if (focus) title.focus();
  }

  function download(key) {
    const [name, description] = profiles[key];
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 420;
    const context = canvas.getContext("2d");
    context.fillStyle = "#fdfdfa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#285b36";
    context.fillRect(52, 104, 796, 3);
    context.font = "bold 28px monospace";
    context.fillText("kodiraj.mk", 52, 80);
    context.fillStyle = "#252922";
    context.font = "bold 48px monospace";
    context.fillText(name, 52, 192);
    context.font = "28px sans-serif";
    let line = "", y = 252;
    for (const word of description.split(" ")) {
      if (context.measureText(line + word).width > 790) {
        context.fillText(line.trimEnd(), 52, y);
        line = "";
        y += 39;
      }
      line += word + " ";
    }
    context.fillText(line.trimEnd(), 52, y);
    const link = element("a");
    link.download = "kodiraj-profile.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function renderResult() {
    const scores = Object.fromEntries(Object.keys(profiles).map((key) => [key, 0]));
    for (const answer of answers) scores[answer] += 1;
    const max = Math.max(...Object.values(scores));
    const key = [...answers].reverse().find((answer) => scores[answer] === max);
    const [name, description, path, courses] = profiles[key];
    const result = element("div");
    const heading = element("h2", name);
    heading.lang = "en";
    heading.tabIndex = -1;
    result.append(heading, element("p", description), element("h3", "Предложена патека"), element("p", path), element("h3", "Планирани курсеви"));
    const list = element("ul", undefined, "course-list");
    for (const [route, course] of courses) {
      const item = element("li");
      const anchor = element("a", course);
      anchor.href = url(route);
      item.append(anchor);
      list.append(item);
    }
    const breakdown = element("details");
    const points = element("ul", undefined, "course-list");
    for (const [id, score] of Object.entries(scores)) points.append(element("li", profiles[id][0] + " — " + score));
    breakdown.append(element("summary", "Види ги поените по профил"), points);
    const actions = element("div", undefined, "control-row");
    const save = element("button", "Зачувај картичка (PNG)", "arcade-button");
    save.addEventListener("click", () => download(key));
    const restart = element("button", "Почни повторно", "arcade-button");
    restart.addEventListener("click", () => { answers.length = index = 0; renderQuestion(true); });
    actions.append(save);
    if (navigator.share) {
      const share = element("button", "Сподели", "arcade-button");
      share.addEventListener("click", async () => {
        try { await navigator.share({ text: summary(key), url: url("quiz") }); }
        catch (error) { if (error.name !== "AbortError") download(key); }
      });
      actions.append(share);
    }
    actions.append(restart);
    result.append(list, breakdown, actions);
    host.replaceChildren(result);
    heading.focus();
    unlock("quiz");
  }

  renderQuestion();
})();
