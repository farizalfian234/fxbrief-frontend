#!/usr/bin/env node
/*
 * Generates dist/fxbrief-frontend/browser/sitemap.xml after a production build.
 *
 * Static public routes are always included. Dynamic rows (articles, weekly
 * recaps) are pulled from the backend's GET /public/sitemap-entries when it is
 * reachable; if the fetch fails the static-only sitemap is still written so the
 * deploy never blocks on backend availability.
 *
 * Env:
 *   APP_URL  public origin used for <loc> (default https://fx-brief.com)
 *   API_URL  backend base url (default https://api.fx-brief.com)
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const APP_URL = (process.env.APP_URL || 'https://fx-brief.com').replace(/\/$/, '');
const API_URL = (process.env.API_URL || 'https://api.fx-brief.com').replace(/\/$/, '');
const OUT = resolve('dist/fxbrief-frontend/browser/sitemap.xml');

const staticEntries = [
  { path: '/', changeFreq: 'weekly', priority: 1.0 },
  { path: '/about', changeFreq: 'monthly', priority: 0.6 },
  { path: '/privacy', changeFreq: 'yearly', priority: 0.3 },
  { path: '/terms', changeFreq: 'yearly', priority: 0.3 },
  { path: '/support', changeFreq: 'monthly', priority: 0.5 },
  { path: '/articles', changeFreq: 'daily', priority: 0.8 },
  { path: '/weekly-recap', changeFreq: 'weekly', priority: 0.8 }
];

async function fetchDynamic() {
  try {
    const res = await fetch(`${API_URL}/public/sitemap-entries`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const body = await res.json();
    return Array.isArray(body?.data) ? body.data : [];
  } catch (err) {
    console.warn(`[sitemap] backend fetch failed, writing static-only sitemap: ${err.message}`);
    return [];
  }
}

function urlBlock(entry) {
  const loc = `${APP_URL}${entry.path}`;
  const lastmod = entry.lastModified ? `\n    <lastmod>${entry.lastModified}</lastmod>` : '';
  const priority = Number(entry.priority ?? 0.5).toFixed(1);
  return `  <url>\n    <loc>${loc}</loc>${lastmod}\n    <changefreq>${entry.changeFreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

(async () => {
  const dynamic = await fetchDynamic();
  const all = [...staticEntries, ...dynamic];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all
    .map(urlBlock)
    .join('\n')}\n</urlset>\n`;

  if (!existsSync(dirname(OUT))) mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, xml, 'utf8');
  console.log(`[sitemap] wrote ${all.length} urls to ${OUT}`);
})();
