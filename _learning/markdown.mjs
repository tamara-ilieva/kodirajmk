export const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

function url(value) {
  if (/^(?:https?:\/\/|mailto:)/i.test(value) || (/^[^:\s\\]+$/.test(value) && !value.startsWith('//'))) return html(value);
  throw new Error('Unsupported URL: ' + value);
}

function inline(source) {
  const tokens = /`([^`\n]+)`|(!?)\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|\$([^$\n]+)\$/g;
  let result = '';
  let cursor = 0;
  for (const match of source.matchAll(tokens)) {
    const [token, code, image, label, href, bold, italic, math] = match;
    result += html(source.slice(cursor, match.index));
    if (code) result += '<code>' + html(code) + '</code>';
    if (href) result += image ? '<img loading="lazy" src="' + url(href) + '" alt="' + html(label) + '">' : '<a href="' + url(href) + '">' + html(label) + '</a>';
    if (bold) result += '<strong>' + html(bold) + '</strong>';
    if (italic) result += '<em>' + html(italic) + '</em>';
    if (math) result += '<span data-math>\\(' + html(math) + '\\)</span>';
    cursor = match.index + token.length;
  }
  return result + html(source.slice(cursor));
}

const pythonToken = /#[^\n]*|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\b(?:False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b|\b\d+(?:\.\d+)?\b/g;
function highlight(source) {
  let result = '';
  let cursor = 0;
  for (const match of source.matchAll(pythonToken)) {
    const token = match[0];
    const kind = token.startsWith('#') ? 'comment' : /^['"]/.test(token) ? 'string' : /^\d/.test(token) ? 'number' : 'keyword';
    result += html(source.slice(cursor, match.index)) + '<span class="token-' + kind + '">' + html(token) + '</span>';
    cursor = match.index + token.length;
  }
  return result + html(source.slice(cursor));
}

const callouts = new Map([['note','Белешка'],['important','Важно'],['warning','Предупредување'],['mistake','Честа грешка'],['summary','Резиме']]);
const disclosures = new Map([['explanation','Објаснување'],['solution','Решение'],['hint','Насока']]);
const exercises = new Map([['quiz','Прашање'],['predict','Предвиди го излезот'],['bug','Пронајди ја грешката'],['practice','Практична вежба']]);
const fence = /^`{3}([\w-]*)(?:\s+(.+))?$/;
const directive = /^:::([\w-]+)(?:\s+(.+))?$/;
const heading = /^(#{1,6})\s+(.+)$/;
const list = /^\s*([-*]|\d+[.])\s+(.+)$/;
const divider = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/;
const cells = line => line.trim().replace(/^\||\|$/g,'').split('|').map(cell => cell.trim());

function renderCode(language, filename, source) {
  if (language === 'python-editor') {
    return '<div class="lesson-editor" data-python-editor><label>Python<textarea spellcheck="false" rows="7">\n' + html(source) +
      '</textarea></label><details><summary>Влез за програмата</summary><label>Влез, по еден ред за секое читање<textarea data-stdin rows="3"></textarea></label></details><div class="lesson-actions"><button type="button" data-run>Изврши</button><button type="button" data-stop disabled>Запри</button></div><pre role="status" aria-label="Излез" tabindex="0"></pre></div>';
  }
  const caption = filename || (language === 'console' ? 'Конзола' : language || 'Код');
  return '<figure class="lesson-code"><figcaption>' + html(caption) +
    (language === 'console' ? '' : ' <button type="button" data-copy>Копирај</button>') +
    '</figcaption><pre tabindex="0"><code>' + (language === 'python' ? highlight(source) : html(source)) + '</code></pre></figure>';
}

export function renderMarkdown(markdown, visualizations = new Map()) {
  const toc = [];
  const ids = new Set(['learning-main','lesson-content']);
  let quizId = 0;

  function renderComponent(type, label, body) {
    if (callouts.has(type)) {
      return '<aside class="lesson-callout" data-callout="' + type + '"><p><strong>' + html(label || callouts.get(type)) + '</strong></p>' + blocks(body,false) + '</aside>';
    }
    if (disclosures.has(type)) {
      return '<details class="lesson-disclosure"><summary>' + html(label || disclosures.get(type)) + '</summary>' + blocks(body,false) + '</details>';
    }
    if (exercises.has(type)) {
      const options = body.filter(row => /^- \[[ x]\] /.test(row));
      const prompt = blocks(body.filter(row => !options.includes(row)),false);
      const title = html(label || exercises.get(type));
      if (type === 'practice') return '<section class="lesson-callout"><h3>' + title + '</h3>' + prompt + '</section>';
      if (options.length < 2 || options.filter(row => row.startsWith('- [x]')).length !== 1) {
        throw new Error(type + ' requires at least two options and exactly one correct choice');
      }
      const name = 'question-' + ++quizId;
      return '<form class="lesson-quiz" data-quiz><fieldset><legend>' + title + '</legend>' + prompt +
        options.map(row => '<label><input required type="radio" name="' + name + '" value="' +
          (row.startsWith('- [x]') ? 'correct' : 'incorrect') + '"> <span>' + inline(row.slice(6)) + '</span></label>').join('') +
        '</fieldset><button type="submit">Провери</button><p role="status"></p></form>';
    }
    if (type === 'visualization' && visualizations.has(label)) {
      const payload = JSON.stringify(JSON.parse(body.join('\n')));
      return '<div data-visualization="' + html(visualizations.get(label)) + '"><button type="button">Прикажи визуелизација</button><pre hidden>' + html(payload) + '</pre><p role="status"></p></div>';
    }
    throw new Error('Unknown component: ' + type + ' ' + (label || ''));
  }

  function blocks(lines, main = true) {
    const output = [];
    let index = 0;
    while (index < lines.length) {
      const line = lines[index++];
      if (!line.trim()) continue;
      const code = fence.exec(line);
      const component = directive.exec(line);
      const title = heading.exec(line);
      if (code || component || line === '$$') {
        const closing = code ? '```' : component ? ':::' : '$$';
        const start = index;
        let depth = 0;
        let nestedFence = '';
        while (index < lines.length) {
          const current = lines[index].trim();
          if (component) {
            if (nestedFence) {
              if (current === nestedFence) nestedFence = '';
              index++;
              continue;
            }
            if (fence.test(current)) nestedFence = '```';
            else if (current === '$') nestedFence = '$';
            else if (directive.test(current)) depth++;
          }
          if (current === closing) {
            if (depth === 0) break;
            depth--;
          }
          index++;
        }
        if (index === lines.length) throw new Error('Missing closing delimiter for ' + line);
        const body = lines.slice(start,index++);
        if (code) output.push(renderCode(code[1],code[2],body.join('\n')));
        else if (component) output.push(renderComponent(component[1],component[2],body));
        else output.push('<div data-math>\\[' + html(body.join('\n')) + '\\]</div>');
      } else if (title) {
        const [, marks, label] = title;
        const level = Math.max(2,marks.length);
        const stem = label.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'') || 'section';
        let id = stem;
        for (let count = 2; ids.has(id); count++) id = stem + '-' + count;
        ids.add(id);
        if (main && level <= 3) toc.push({ id, label: label.replace(/[*`]/g,''), level });
        output.push('<h' + level + ' id="' + html(id) + '">' + inline(label) + '</h' + level + '>');
      } else if (/^!\[[^\]]+\]\([^)]+\)$/.test(line)) {
        const caption = lines[index]?.startsWith('Caption: ') ? lines[index++].slice(9) : '';
        output.push('<figure>' + inline(line) + (caption ? '<figcaption>' + inline(caption) + '</figcaption>' : '') + '</figure>');
      } else if (line.includes('|') && divider.test(lines[index] ?? '')) {
        const headers = cells(line);
        index++;
        const rows = [];
        while (lines[index]?.includes('|') && lines[index].trim()) rows.push(cells(lines[index++]));
        output.push('<div class="lesson-table" tabindex="0" role="region" aria-label="Табела"><table><thead><tr>' +
          headers.map(cell => '<th scope="col">' + inline(cell) + '</th>').join('') + '</tr></thead><tbody>' +
          rows.map(row => '<tr>' + headers.map((_,i) => '<td>' + inline(row[i] ?? '') + '</td>').join('') + '</tr>').join('') +
          '</tbody></table></div>');
      } else if (list.test(line)) {
        const tag = /^\s*\d/.test(line) ? 'ol' : 'ul';
        const items = [list.exec(line)[2]];
        while (list.test(lines[index] ?? '') && /^\s*\d/.test(lines[index]) === (tag === 'ol')) items.push(list.exec(lines[index++])[2]);
        output.push('<' + tag + '>' + items.map(item => '<li>' + inline(item) + '</li>').join('') + '</' + tag + '>');
      } else if (line.startsWith('> ')) {
        const quote = [line.slice(2)];
        while (lines[index]?.startsWith('> ')) quote.push(lines[index++].slice(2));
        output.push('<blockquote>' + blocks(quote,false) + '</blockquote>');
      } else {
        const paragraph = [line];
        while (lines[index]?.trim() && !/^(?:#{1,6}\s|:::|`{3}|\$\$$|> |!\[)/.test(lines[index]) &&
               !list.test(lines[index]) && !divider.test(lines[index + 1] ?? '')) paragraph.push(lines[index++]);
        output.push('<p>' + inline(paragraph.join(' ')) + '</p>');
      }
    }
    return output.join('\n');
  }
  return { body: blocks(markdown.replace(/\r\n/g,'\n').split('\n')), toc };
}
