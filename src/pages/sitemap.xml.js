import { pages } from '../data/pages.js';
import { episodes } from '../data/videos.js';

export function GET({ site }) {
    const entries = [
        ...pages.map(page => ({ loc: new URL(page.slug ?? '/', site) })),
        ...episodes.map(episode => ({ loc: new URL(`/episodes/${episode.slug}`, site), lastmod: episode.date }))
    ];
    const urls = entries.map(({ loc, lastmod }) => `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>\n`;

    return new Response(sitemap, { headers: { 'Content-Type': 'application/xml' } });
}
