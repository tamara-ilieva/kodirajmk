import { createProgress, courseSnapshot } from './learning-progress.mjs';

const progress = document.querySelector('[data-progress]');
if (progress) {
  const store = createProgress(progress.dataset.progress);
  const links = [...document.querySelectorAll('[data-lesson]')];
  const ids = links.map(link => link.dataset.lesson);
  const current = document.querySelector('[data-current-lesson]')?.dataset.currentLesson;
  const input = document.querySelector('[data-complete]');
  const resume = progress.querySelector('[data-continue]');
  const reset = progress.querySelector('[data-reset]');

  function render(state) {
    const snapshot = courseSnapshot(state, ids);
    progress.querySelector('progress').value = snapshot.percent;
    progress.querySelector('[data-percent]').textContent = snapshot.percent + '%';
    for (const link of links) {
      const done = snapshot.completed.has(link.dataset.lesson);
      link.nextElementSibling.textContent = done ? ' ✓' : '';
      if (done) link.setAttribute('aria-label', link.textContent + ' · завршена');
      else link.removeAttribute('aria-label');
    }
    const target = links.find(link => link.dataset.lesson === snapshot.resume);
    resume.hidden = !target;
    if (target) {
      resume.href = target.href;
      resume.textContent = state.last || snapshot.completed.size ? 'Продолжи со учење' : 'Започни со учење';
    }
    reset.hidden = !state.last && snapshot.completed.size === 0;
    if (input) input.checked = snapshot.completed.has(current);
  }

  if (input) {
    store.save({ ...store.read(), last: current });
    input.closest('label').hidden = false;
    input.addEventListener('change', () => {
      const state = store.read();
      const completed = new Set(state.completed);
      if (input.checked) completed.add(current);
      else completed.delete(current);
      store.save({ completed: [...completed], last: current });
      render(store.read());
    });
  }
  reset.addEventListener('click', () => {
    if (!window.confirm('Да се ресетира напредокот за овој курс?')) return;
    store.save({ completed: [], last: null });
    render(store.read());
    resume.focus();
  });
  render(store.read());
  window.addEventListener('storage', event => {
    if (event.key === store.key || event.key === null) render(store.read());
  });
  window.addEventListener('pageshow', () => render(store.read()));
}

const wide = window.matchMedia('(min-width: 64rem)');
function setNavigation() {
  for (const disclosure of document.querySelectorAll('[data-desktop-open]')) disclosure.open = wide.matches;
}
setNavigation();
wide.addEventListener('change', setNavigation);

for (const form of document.querySelectorAll('[data-quiz]')) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const choice = form.querySelector('input:checked');
    form.querySelector('[role="status"]').textContent = choice?.value === 'correct' ? 'Точно.' : 'Обиди се повторно.';
  });
  form.addEventListener('change', () => { form.querySelector('[role="status"]').textContent = ''; });
}

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const code = button.closest('figure').querySelector('code');
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = 'Копирано';
    } catch {
      const selection = window.getSelection();
      selection.selectAllChildren(code);
      button.textContent = 'Означено за копирање';
    }
  });
}

if (document.querySelector('[data-python-editor]')) {
  import('./learning-editor.mjs').then(({ mountEditors }) => mountEditors()).catch(() => {
    for (const editor of document.querySelectorAll('[data-python-editor]')) editor.querySelector('pre').textContent = 'Уредувачот за Python е недостапен.';
  });
}

if (document.querySelector('[data-math]')) {
  window.MathJax = { startup: { typeset: false }, tex: { packages: { '[-]': ['require', 'autoload'] } } };
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4.0.0/tex-chtml.js';
  script.onload = async () => {
    try {
      await window.MathJax.startup.promise;
      await window.MathJax.typesetPromise([...document.querySelectorAll('[data-math]')]);
    } catch { /* Keep the source readable if typesetting fails. */ }
  };
  document.head.append(script);
}

for (const container of document.querySelectorAll('[data-visualization]')) {
  const button = container.querySelector('button');
  const status = container.querySelector('[role="status"]');
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Се вчитува…';
    const target = document.createElement('div');
    try {
      const module = await import('./visualizations/' + container.dataset.visualization);
      container.append(target);
      await module.mount(target, JSON.parse(container.querySelector('pre').textContent));
      button.hidden = true;
      status.textContent = '';
    } catch {
      target.remove();
      status.textContent = 'Визуелизацијата е недостапна.';
      button.disabled = false;
    }
  });
}
