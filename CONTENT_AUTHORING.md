# Course content authoring

Edit the source files in `_learning/content/`. The generator creates static HTML for GitHub Pages. Every lesson uses the same layout, and the published pages can be read with JavaScript disabled. JavaScript adds progress and interactive controls.

## Build and preview

Use Node.js 20 or later. The generator uses Node's built-in modules and requires no package installation. Run these commands from the repository root.

```sh
node _learning/build.mjs
node _learning/build.mjs --check
```

Serve the repository root over HTTP using the local server described in [README.md](README.md). Open `/python/` to see the catalog. The same relative links resolve under a GitHub Pages project prefix.

Commit both the content sources and the generated HTML, including `_learning/generated.json` and any generated page deletions. Keep the existing GitHub Pages branch and root configuration. The Jekyll configuration excludes `_learning/` from the published site. If you use another static host, exclude that directory from the deployment as well. For a public repository, source files, including drafts, are visible in the repository and its history.

## Create a course or module

The directory structure maps to the public URL.

```text
_learning/content/
  <subject>/subject.json
  <subject>/<course>/course.json
  <subject>/<course>/<module>/module.json
  <subject>/<course>/<module>/<lesson>.md

/<subject>/<course>/<module>/<lesson>/
```

1. Copy an existing `course.json` into a new directory under the subject. For a new subject, copy and adapt `python/subject.json` as well.
2. Set `slug` to the directory name and supply `title`, `description`, numeric `order`, `prerequisites` and `outcomes`. Use an `outline` array for planned topics while there are no module directories. Set `status` to `coming-soon` or `available`.
3. For each module, create a directory inside the course directory. Copy an existing `module.json` and set `slug`, `title` and numeric `order`. Modules can start with zero published lessons.
4. Rebuild. The course landing page lists module titles as soon as module directories exist.

Use lowercase ASCII slugs with hyphens. Names shown to readers can use Macedonian Cyrillic. Keep slugs stable after publishing to preserve links.

## Create, order, and publish a lesson

Copy the [blank lesson template](_learning/LESSON_TEMPLATE.md) into the module directory. Save the file as UTF-8 and use the lesson slug as its filename. The metadata between the `---` lines is JSON.

| Field | Value |
| --- | --- |
| `id` | Globally unique stable ID, such as `python-fundamentals-introduction-welcome` |
| `title`, `description` | Lesson heading and page description |
| `slug` | Lowercase URL segment matching the filename without `.md` |
| `course`, `module` | Slugs matching the parent directories |
| `order` | Integer. Lower values appear first. Ties are sorted by slug |
| `status` | `draft` or `published` |
| `minutes`, `difficulty` | Estimated minutes as an integer and optional difficulty label |
| `objectives`, `prerequisites`, `tags` | Arrays of strings. Use `[]` for empty lists |

Write the body below the second `---`. Set `status` to `published` when the lesson is ready and verify that the parent course is `available`. Rebuild and check the course curriculum. To unpublish, set the status to `draft` and rebuild. The generator removes the old HTML and updates navigation. Commit the removal to take the route down on the next Pages deployment.

Set the `order` fields to position courses, modules and lessons. Previous and next links follow published lesson order across module boundaries. Progress uses the stable `id`. Keep it when editing the title or body.

The single published Fundamentals lesson demonstrates the interface. Set its status to `draft` when you are ready to replace it with original material.

## Write Markdown

Use blank lines between blocks. Start body headings with `##` because the lesson title already provides the page heading. Level-two and level-three headings populate the table of contents. The renderer supports paragraphs, headings, flat ordered and unordered lists, blockquotes, emphasis, inline code, links, images, fenced blocks and pipe tables. Use the directives below for learning components. Write raw HTML as text and use simple inline formatting within headings, links and table cells.

### Code and output

Open a triple-backtick fence with `python` for syntax highlighting. Add an optional filename on the opening line.

````text
```python filename.py
[Paste your own Python source here.]
```
````

Use `console` for sample output and `python-editor` for editable, runnable Python. The editor loads Pyodide from jsDelivr on the first run. The program can read lines from the optional input panel. A run uses a fresh worker and ends after 45 seconds or when the reader selects **Запри**. Use standard-library Python for editor exercises. [Pyodide worker documentation](https://pyodide.org/en/0.27.7/usage/webworker.html)

### Images, diagrams and math

Place publication-ready images in `assets/images/`. Reference them with a path relative to the **published lesson URL** so the link works on the custom domain and under a Pages project prefix. From a top-level subject with the hierarchy above, use `../../../../assets/images/filename.svg`.

```markdown
![Describe the diagram for readers who cannot see it](../../../../assets/images/filename.svg)
Caption: [Write the caption here.]
```

Use the same syntax for PNG, SVG, or other browser-supported images. Use `$…$` for inline TeX and delimit a display equation with standalone `$$` lines. MathJax loads only on pages containing math. [MathJax typesetting documentation](https://docs.mathjax.org/en/stable/web/typeset.html)

### Notes, expandable content and exercises

Open a component with `:::type` and close it with `:::` on its own line. Put an optional custom title after the type. Supported callouts are `note`, `important`, `warning`, `mistake` and `summary`. Supported disclosures are `explanation`, `solution` and `hint`.

Use `quiz`, `predict` or `bug` for a multiple-choice question, output prediction, or bug-finding task. Mark exactly one correct answer with `- [x]` and every other option with `- [ ]`. The browser checks the selected option when the reader submits.

```markdown
:::quiz [Question title]
[Write the prompt here.]

- [ ] [First option]
- [x] [Second option]
:::
```

Use `practice` for an open-ended coding exercise. Write the prompt inside the directive and nest an optional `python-editor` fence and `hint` or `solution` disclosures. The reader can run their work in the editor and reveal the solution when ready.

### Register a custom interactive visualization

Place an ES module in `assets/js/visualizations/`. Export `mount(container, data)` and render the controls and labels into the container. Map a stable visualization name to its filename in `_learning/visualizations.json`. Use `:::visualization your-name` with a JSON object as its body. The module is imported when the reader selects **Прикажи визуелизација**. For example, this interface can host a memory diagram, a loop trace, or a recursion stack.

## Local progress

Progress is stored by course in the reader's browser. It counts published lessons, resumes from the last visited lesson, and can be reset from the course page or the lesson curriculum. Draft lessons disappear from the progress calculation when the site is rebuilt.
