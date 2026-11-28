export function mountEditors() {
  for (const editor of document.querySelectorAll('[data-python-editor]')) {
    const run = editor.querySelector('[data-run]');
    const stop = editor.querySelector('[data-stop]');
    const output = editor.querySelector('pre');
    let worker;
    let timer;

    function finish(message) {
      clearTimeout(timer);
      worker?.terminate();
      worker = undefined;
      run.disabled = false;
      stop.disabled = true;
      if (message) output.textContent += message;
    }

    run.addEventListener('click', () => {
      run.disabled = true;
      stop.disabled = false;
      output.textContent = 'Се вчитува Python…';
      try {
        worker = new Worker(new URL('./learning-python-worker.mjs', import.meta.url), { type: 'module' });
        timer = setTimeout(() => finish('\nИстече времето за извршување.'), 45000);
        worker.onmessage = ({ data }) => {
          if (data.type === 'ready') output.textContent = '';
          if (data.type === 'output' && output.textContent.length < 16000) output.textContent += data.text;
          if (data.type === 'error') finish(data.text);
          if (data.type === 'done') finish(output.textContent ? '' : 'Извршено.');
        };
        worker.onerror = () => finish('\nPython е недостапен.');
        worker.postMessage({ source: editor.querySelector('textarea').value, stdin: editor.querySelector('[data-stdin]').value });
      } catch {
        finish('\nPython е недостапен.');
      }
    });
    stop.addEventListener('click', () => {
      finish('\nИзвршувањето е запрено.');
      run.focus();
    });
  }
}
