# Anime Explorer - Wako Addon

A search-first anime browser for [Wako](https://wako.app), with filters for season, year, genre, and airing status. Metadata comes from the free [Jikan API](https://jikan.moe) (a wrapper around MyAnimeList).

This addon does not provide streaming sources. It's a lookup and organization tool only.

## What it does

- Search anime by title
- Filter by season (Winter / Spring / Summer / Fall), year, genre, and status
- Browse results as a poster grid with score, episode count, and genre tags
- Tapping a result opens its MyAnimeList page for full details

## Where it lives in Wako

Wako's addon SDK doesn't support adding a fully independent tab to the app's bottom navigation; the available hooks are movie/show/episode detail buttons, a settings page, and one dedicated "plugin detail" page. This addon uses that plugin detail page as its home. You'll open it from Wako's Add-ons list rather than from the main tab bar.

## Local development

```bash
npm install
npm start
```
Opens at `http://localhost:4200`.

To test in the actual Wako app on your device:
```bash
npm run start:wako-like
```
Then in Wako: Settings > Add-ons > Install a third-party add-on, and enter `http://YOUR_COMPUTER_IP:4200/assets/plugins/manifest.json`.

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) is already set up: every push to `main` builds the addon and publishes the `dist` folder to GitHub Pages automatically. No manual build/upload steps needed after the initial setup below.

### One-time setup

1. Create a new GitHub repo (e.g. `wako-anime-explorer`) and push this code to it.
2. In the repo, go to **Settings > Pages** and set **Source** to "GitHub Actions".
3. Push to `main` (or re-run the workflow from the Actions tab). GitHub will build and publish automatically.
4. Your addon will be live at `https://YOUR_USERNAME.github.io/wako-anime-explorer/`.
5. Open `projects/plugin/src/manifest.json` and replace `REPLACE_WITH_YOUR_GITHUB_USERNAME` in the `entryPointV2` URL with your actual GitHub username, then commit and push again.

### Installing in Wako

In Wako: Settings > Add-ons > Install a third-party add-on, and enter:
```
https://YOUR_USERNAME.github.io/wako-anime-explorer/manifest.json
```

## Project structure

```
projects/plugin/src/
  manifest.json                 addon metadata + entry point
  plugin/
    plugin.module.ts             addon entry point, wires all components
    plugin-detail/                the anime search + filter screen (main feature)
    services/anime.service.ts     Jikan API client
    settings/                     addon settings page
    movie-button/, show-button/,
    episode-button/, episode-item-option/,
    media-modal/                  unused stubs kept for SDK compatibility
  i18n/en.json                    UI strings
```
