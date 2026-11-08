# AGENTS.md

Guidance for AI coding agents working on this repository. Read `README.md` first: it explains the site, how content is added, the build checks and how deployment works. This file covers what an agent needs on top of that.

## Commands

```bash
npm install
npm run dev     # Development server on http://localhost:4321
npm run build   # Full build into dist/, including the build checks
```

There are no tests or linters. Run `npm run build` after every change: it fails on bad data in `videos.json`, and its log lists data warnings. The owner often has the development server running already, so check for one on port 4321 before starting another.

Node.js 22.23.4 or later is required and is managed with fnm. If `node` isn't found in a new shell, load fnm first, for example `eval "$(fnm env --shell bash)"`.

## Content files

- **`public/podcast.xml` is written by hand.** Never regenerate, reformat or reorder it. Edit only the lines a change needs.
- **`<pubDate>` is the recording date** and `date` in `videos.json` is the YouTube publish date, so they usually differ by a day or two. That's expected, not a mistake.
- **Slugs are permanent URLs.** Never change a published slug.
- **Don't edit episode show notes**, including the requests to follow the show on social media.

## Code style

- Match the surrounding code: 4-space indentation in JavaScript, Astro and CSS, and 2 spaces in JSON config files.
- In CSS, group properties the way `src/styles/styles.css` already does, with blank lines between groups.
- Visible labels use title case to match the site, for example "Show Notes" and "Watch Now".
- Use plain HTML, CSS and JavaScript with Bootstrap's classes. Don't add a UI framework, a CSS preprocessor or Font Awesome. Icons are inline SVGs in `src/data/icons.js`.
- Write comments, documentation and commit messages in American English.

## Dependencies

- Use `^` version ranges in `package.json`. Never pin exact versions or use `--save-exact`.
- Keep dependencies to a minimum. Most features don't need a new package.

## Things to leave alone

- **The service worker URL `/sw.min.js`** must stay the same, because returning visitors' browsers check it for updates. Change `CACHE_NAME` in `src/scripts/sw.js` only when visitors' old caches need clearing.
- **Transcripts** are out of scope. Don't propose or plan them.
- **The theme:** only a press of the theme toggle saves a choice to `localStorage`. Until then the site follows the system theme.

## Git

- Work on `main` unless the owner asks for a branch. Don't create branches on your own.
- Commit or push only when asked.
- Commits are GPG-signed. If signing fails because the passphrase prompt was canceled, try once more so the owner can enter it. Never turn off signing.
- Follow the commit message patterns in `README.md`.
- Pushing `main` deploys the live site straight away.
