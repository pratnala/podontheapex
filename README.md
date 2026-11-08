# Pod on the Apex

The website for [Pod on the Apex](https://www.podontheapex.com), a Formula 1 podcast by Pratyush and Aniket.

It's a static site built with [Astro](https://astro.build/) and hosted on Cloudflare Workers. Bootstrap handles most of the styling. There's no server or database: every page is generated from `public/videos.json` and `public/podcast.xml` at build time.

## Running it locally

You'll need Node.js 22.23.4 or later.

```bash
npm install
npm run dev
```

The service worker only exists in a full build, so `npm run dev` logs a failed registration in the console. That's harmless. To test the service worker or anything else that depends on Cloudflare, build the site and serve it with Wrangler:

```bash
npm run build
npx wrangler dev
```

## Adding content

### New podcast episode

An episode needs an entry in both files. The slug and GUID link them together.

**1. Add it to `public/podcast.xml`**, at the end of the existing entries. Set `<link>` to the episode's page.

```xml
<item>
    <itunes:episodeType>full</itunes:episodeType>
    <itunes:season>2</itunes:season>
    <itunes:episode>29</itunes:episode>
    <title>Episode title</title>
    <description>
        Show notes. Basic HTML such as links and line breaks is fine.
    </description>
    <enclosure url="https://dts.podtrac.com/redirect.mp3/episodes.podontheapex.com/2026-10-20.mp3" type="audio/mpeg" length="72394442"/>
    <guid isPermaLink="false">A-NEW-UNIQUE-ID</guid>
    <link>https://www.podontheapex.com/episodes/2026-united-states-gp-review</link>
    <pubDate>Tue, 20 Oct 2026 22:00:00 +0530</pubDate>
    <itunes:duration>2262</itunes:duration>
    <itunes:explicit>false</itunes:explicit>
</item>
```

`<pubDate>` is the date the episode was **recorded**.

**2. Add it to `public/videos.json`**, using the same GUID.

```json
{
    "id": "YouTube video ID",
    "title": "Title as it appears on YouTube",
    "season": "2026",
    "date": "2026-10-21",
    "categories": ["podcast"],
    "slug": "2026-united-states-gp-review",
    "guid": "A-NEW-UNIQUE-ID"
}
```

`date` is the date the video was **published** on YouTube, so it's usually a day or two after the recording date. The episode page shows this date and uses this title.

Only entries with `podcast` in `categories` need `slug` and `guid`. Add `prediction` as well for predictions episodes.

The newest podcast entry appears in the latest episode section at the top of the homepage, so nothing else needs changing there.

### Slugs

Slugs become permanent URLs, so don't change one after it's published.

| Episode | Format | Example |
|---|---|---|
| Race predictions | `<year>-<race>-gp-predictions` | `2026-singapore-gp-predictions` |
| Race review | `<year>-<race>-gp-review` | `2026-bahrain-gp-review` |
| Anything else | A short version of the title | `cycling-to-every-f1-circuit` |

Season 1 episodes use `preview` for pre-race episodes instead of `predictions`.

### Shorts, clips and other videos

Add an entry to `public/videos.json` with no `slug` or `guid`. Leave `season` empty, as these pages don't have season tabs.

```json
{
    "id": "YouTube video ID",
    "title": "Title as it appears on YouTube",
    "season": "",
    "date": "2026-10-27",
    "categories": ["short"]
}
```

| Category | Page |
|---|---|
| `podcast` | `/` |
| `short` | `/shorts` |
| `prediction` | `/predictions` |
| `learn` | `/learn` |
| `history` | `/history` |
| `instant-reaction` | `/instant-reactions` |
| `clip` | `/clips` |
| `collab` | `/collabs` |
| `live` | `/live` |

A video can have more than one category.

### Build checks

`src/data/videos.js` checks the data on every build.

**The build stops if:**

- a podcast entry has a missing, invalid or duplicate slug
- a podcast entry's GUID isn't in the feed
- two videos share the same ID

**The build log shows a warning if:**

- a video is dated before its recording date
- a feed entry's `<link>` doesn't match its episode page
- a feed entry has no matching video

Warnings don't stop the site from deploying, so check the log after adding an episode.

Thumbnails aren't checked. They load from YouTube using each video's ID, and YouTube doesn't guarantee a `maxresdefault` image for every upload, so look at the card after adding a video.

## How it's organized

```
public/                  Served as is
  podcast.xml            Podcast RSS feed, edited by hand
  videos.json            All videos
  fonts/, img/           Fonts, icons and images
src/
  assets/logos/          Page logos, resized at build time
  components/            Hero, navbar, footer, cards, latest episode and icons
  data/
    icons.js             SVG icons
    pages.js             Settings for each list page
    videos.js            Reads the videos and feed, and checks them
  layouts/Layout.astro   Shared page layout and meta tags
  pages/
    [...slug].astro      Generates the list pages from pages.js
    episodes/[slug].astro  Generates a page for each episode
    404.astro            Not found page
    sitemap.xml.js       Generates the sitemap
  scripts/
    custom.js            Theme toggle, video players, seasons and pagination
    sw.js                Service worker
  styles/styles.css      Site styles
```

### Common changes

- **Page title, description or items per page:** edit `src/data/pages.js`. `description` is the text in the hero, and `metaDescription` is what appears in search results.
- **New list page:** add an entry to `src/data/pages.js` with a new category, then add it to the links in `src/components/Navbar.astro`.
- **New icon:** add its SVG to `src/data/icons.js`, then use `<Icon name="your-icon" />`.

### Service worker

Edit `src/scripts/sw.js`. The build minifies it to `/sw.min.js`, and that URL must not change, because returning visitors' browsers check it for updates.

Change `CACHE_NAME` in `sw.js` when you need to clear visitors' old caches. Pages are fetched from the network first, and other files come from the cache first.

## Deployment

Cloudflare Workers Builds deploys from this repository, using `npm run build` and the settings in `wrangler.jsonc`.

| Branch | What happens |
|---|---|
| `main` | Deploys to the live site |
| Any other branch | Builds a Cloudflare preview for testing |

Small changes go straight to `main`. For a bigger change, push it to a separate branch first, check the preview, then fast-forward `main` to it. A fast-forward only works if `main` has no commits the branch lacks.

```bash
git switch main
git merge --ff-only your-branch
git push origin main
```

If a deploy goes wrong, roll back to the previous version from the Worker's Deployments page in Cloudflare.

## Commit messages

Episode, video and dependency commits follow this pattern:

```text
Add 2026-10-07 episode to website and podcast RSS
Add 2026-10-27 short to website
Upgrade node dependencies
```

Other commits use a short summary in the imperative, such as `Feature the latest episode on the homepage`.
