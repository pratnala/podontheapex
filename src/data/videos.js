import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { XMLParser } from 'fast-xml-parser';

const publicDir = join(process.cwd(), 'public');
const siteUrl = 'https://www.podontheapex.com';

const rawVideos = JSON.parse(readFileSync(join(publicDir, 'videos.json'), 'utf8'));
const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    isArray: name => name === 'item'
});
const feedItems = parser.parse(readFileSync(join(publicDir, 'podcast.xml'), 'utf8')).rss.channel.item;
const feedByGuid = new Map(feedItems.map(item => [item.guid['#text'].trim(), item]));

function stripHtml(html) {
    return html.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function summarize(text, maxLength = 155) {
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.slice(0, text.lastIndexOf(' ', maxLength))}...`;
}

function recordingDate(pubDate) {
    // The feed date is the recording date, in the offset it was written in
    return new Date(`${pubDate.trim().slice(5, 16)} UTC`).toISOString().slice(0, 10);
}

function formatDate(date) {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', dateStyle: 'long' });
}

function checkVideos() {
    const errors = [];
    const warnings = [];
    const seenIds = new Set();
    const seenSlugs = new Set();
    const usedGuids = new Set();

    rawVideos.forEach(video => {
        if (seenIds.has(video.id)) {
            errors.push(`Duplicate video id ${video.id}`);
        }
        seenIds.add(video.id);

        if (!video.categories.includes('podcast')) {
            return;
        }
        if (!video.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(video.slug)) {
            errors.push(`"${video.title}" needs a valid slug`);
        } else if (seenSlugs.has(video.slug)) {
            errors.push(`Duplicate slug ${video.slug}`);
        }
        seenSlugs.add(video.slug);

        const item = feedByGuid.get(video.guid);
        if (!item) {
            errors.push(`"${video.title}" has no feed entry with guid ${video.guid}`);
            return;
        }
        usedGuids.add(video.guid);

        if (video.date < recordingDate(item.pubDate)) {
            warnings.push(`"${video.title}" is dated ${video.date}, before it was recorded on ${recordingDate(item.pubDate)}`);
        }
        const episodeUrl = `${siteUrl}/episodes/${video.slug}`;
        if (item.link !== episodeUrl) {
            warnings.push(`"${item.title}" should have <link>${episodeUrl}</link> in the feed`);
        }
    });

    feedByGuid.forEach((item, guid) => {
        if (!usedGuids.has(guid)) {
            warnings.push(`"${item.title}" is in the feed but not in videos.json`);
        }
    });

    warnings.forEach(warning => console.warn(`[videos] ${warning}`));
    if (errors.length > 0) {
        throw new Error(`videos.json has problems:\n${errors.join('\n')}`);
    }
}

checkVideos();

export const videos = [...rawVideos].sort((a, b) => new Date(b.date) - new Date(a.date));

// Newest first, like the rest of the site
export const episodes = videos
    .filter(video => video.categories.includes('podcast'))
    .map(video => {
        const item = feedByGuid.get(video.guid);
        return {
            ...video,
            dateLabel: formatDate(video.date),
            seasonNumber: item['itunes:season'],
            episodeNumber: item['itunes:episode'],
            duration: item['itunes:duration'],
            audioUrl: item.enclosure['@_url'],
            showNotes: item.description.trim(),
            summary: summarize(stripHtml(item.description))
        };
    });
