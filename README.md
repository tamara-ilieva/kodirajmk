# kodiraj.mk

Coming Soon page for a Macedonian platform for learning programming and technology. Frog Jump is an original pixel-art endless runner that runs entirely in the browser.

## Local development

Open `index.html` directly in a modern browser for a quick preview. For a stable origin and consistent high-score storage, serve the project folder over HTTP. One option with Python 3 already installed is:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://localhost:8000/). The site itself is plain HTML, CSS and JavaScript and needs no dependencies or build command. Edit the copy in `index.html`, the layout in `assets/css/style.css`, and the game rules and sprites in `assets/js/game.js`.

## Frog Jump

Focus the game area with Tab and press Space or Arrow Up, or tap the scene. The **Играј** button also starts a run. While the game area has focus, Space, Arrow Up and taps jump. After a collision, press Enter or Space in the game, tap the scene, or use **Играј повторно**. Scores are saved per browser origin when a run ends or the page is left. With reduced motion enabled, decorative clouds and ground details stay still during play.

To check a change, leave the page idle and confirm the score stays at zero. Start a run, jump over the first bug, and let the frog hit a later obstacle. Confirm that the game-over message appears and the score stops. Restart and confirm the current score resets. Reload after a scored run and check the record. At mobile and tablet widths, check that the topics reflow, the page has no horizontal overflow, and swiping outside the game still scrolls.

## Deploy to GitHub Pages

1. Put `index.html`, `favicon.svg`, `assets/` and this README at the repository root and push to `main`.
2. Open the repository's **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, then save.
3. Open the published URL shown under **Pages** and check that the game and assets load. The relative asset paths support the repository subpath.

[GitHub Pages publishing source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Connect kodiraj.mk

1. Verify `kodiraj.mk` under the repository owner's GitHub account or organization **Settings → Pages**. Add the TXT record GitHub supplies at your DNS provider and complete verification.
2. In the repository's **Settings → Pages → Custom domain**, enter `kodiraj.mk` and save. GitHub creates a `CNAME` file on the publishing branch. Keep it when updating the site.
3. At your DNS provider, add the following A records at the apex (usually named `@`). Replace any conflicting apex records that point to another web host.

   | Type | Host | Value |
   | --- | --- | --- |
   | A | @ | `185.199.108.153` |
   | A | @ | `185.199.109.153` |
   | A | @ | `185.199.110.153` |
   | A | @ | `185.199.111.153` |

   To also support `www.kodiraj.mk`, create a `www` CNAME pointing to `YOUR-OWNER.github.io`. GitHub Pages can then redirect it to the apex.
4. Once the DNS check passes and the certificate is ready, enable **Enforce HTTPS**. Open [kodiraj.mk](https://kodiraj.mk/) and check the page and social image.

[GitHub domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages) · [GitHub custom domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
