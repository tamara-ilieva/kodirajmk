import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs';

self.onmessage = async ({ data: { source, stdin } }) => {
  let remaining = 16000;
  const input = stdin ? stdin.replace(/\r\n/g, '\n').split('\n') : [];
  let lineIndex = 0;
  function write(line) {
    if (remaining <= 0) return;
    const text = (line + '\n').slice(0, remaining);
    remaining -= text.length;
    self.postMessage({ type: 'output', text });
    if (remaining === 0) self.postMessage({ type: 'output', text: '\n…' });
  }
  try {
    const python = await loadPyodide({ stdout: write, stderr: write, stdin: () => input[lineIndex++] ?? null });
    self.postMessage({ type: 'ready' });
    await python.runPythonAsync(source);
    self.postMessage({ type: 'done' });
  } catch (error) {
    self.postMessage({ type: 'error', text: String(error).slice(0, 4000) });
  }
};
