# kodiraj.mk

Coming Soon v2.0 for a free Macedonian programming and technology initiative. The site uses plain HTML, CSS, and JavaScript. It has no build step, backend, accounts or analytics.

## Run locally

Serve the repository root over HTTP so the daily challenge page can fetch its JSON file. With Python 3 installed, run `python -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000/`.

## Site structure

- `index.html` keeps the original landing page and Frog Jump. `games.html` is the catalogue for Frog Jump, Pixel Pairs and Lily Trail.
- `python/`, `cpp/`, `ai/`, `cybersecurity/`, `web/` and `sql/` share previews and planned course lists from `assets/js/courses.js`. Run produces predefined output. The Web preview creates its result from fixed DOM elements.
- `terminal/` is a fictional terminal. Its command allowlist is in `assets/js/terminal.js`. Use ↑ / ↓ for history and Tab for completion. Escape moves focus out of the input.
- `quiz/` contains a 12-question quiz. Scoring, profile descriptions and PNG result cards live in `assets/js/quiz.js`. Each answer scores one point. Ties go to the most recently selected profile among the leaders.
- `challenges/` loads `assets/data/challenges.json`. Keep IDs stable and `correct` set to the zero-based option index. The daily challenge uses midnight in North Macedonia and selects an entry by day number modulo bank length. Editing the bank size or order changes assignments for uncompleted days. The first submitted answer counts as completion, regardless of correctness. The current streak remains active through today if yesterday was completed.
- `assets/js/site.js` provides shared navigation, base-relative routes, themes, and achievements. `404.html` has an explicit base-path fallback for the GitHub project path and the custom-domain root because GitHub Pages serves it at the missing URL.

## Secret Universe

`achievements-data.js` defines the catalogue and `achievements.js` owns timestamped unlocks, notifications and completion. `easter-eggs.js` listens for page interactions and `kodiraj:*` game events. `themes.js` manages the CRT and rain effects. Secret terminal input is matched against a fixed table in `secret-terminal.js`. Game, room and achievement files sit alongside the existing static pages. To add a discovery, add its record to the catalogue and call `KodirajSecrets.grant(id)` from the interaction handler. Keep inputs out of HTML strings and use a cancellable effect that respects reduced motion.

For local testing, serve the site on loopback and append `?secret-test=1` to any page. The developer console then exposes `KodirajSecretTest.grant(id)` and `KodirajSecretTest.snapshot()`. Use a separate browser profile to avoid affecting your normal local progress. This helper is disabled on public hosts. The room puzzle and its content run entirely in the browser.

## Local data

Frog Jump uses its original `kodiraj.frog-jump.best` key. The theme, achievements, terminal history and challenge completions are stored only in the browser. Quiz answers stay in memory. Storage is scoped to the origin, so scores and preferences won’t automatically move from GitHub Pages to the custom domain.

## GitHub Pages

Publish the repository root from the branch selected in **Settings → Pages**. The same files work under `/kodirajmk/` or at the root of `kodiraj.mk`. All page and asset paths are relative to the site. Keep the fallback in `404.html` aligned with the project path if the repository is renamed. For the custom domain, verify ownership in GitHub Pages, configure the domain in repository settings, and use the DNS records listed in GitHub’s documentation. Enable HTTPS after the DNS check passes.

[GitHub Pages publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [Custom domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
