#!/usr/bin/env node
/*
 * Regenerates prerender-routes.txt before a production build.
 *
 * Writes the fixed static public routes, then appends up to the 10 most recent
 * published article slugs and 10 most recent weekly-recap slugs pulled from the
 * backend's public list endpoints. If the backend is unreachable the static
 * routes are still written, so the deploy never blocks on backend availability
 * and detail pages simply hydrate client-side (as in Phase 6A) until the next
 * regeneration. Full per-slug coverage is the Phase 7A SSR concern.
 *
 * Env:
 *   API_URL  backend base url (default https://api.fx-brief.com)
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API_URL = (process.env.API_URL || 'https://api.fx-brief.com').replace(/\/$/, '');
const OUT = resolve('prerender-routes.txt');
const SLUG_LIMIT = 10;

const staticRoutes = [
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/support',
  '/login',
  '/register',
  '/forgot-password',
  '/articles',
  '/weekly-recap'
];

async function fetchItems(path) {
  try {
    const res = await fetch(`${API_URL}${path}?page=1`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const body = await res.json();
    const items = body?.data?.items;
    return Array.isArray(items) ? items : [];
  } catch (err) {
    console.warn(`[prerender] fetch ${path} failed: ${err.message}`);
    return [];
  }
}

(async () => {
  const [articles, recaps] = await Promise.all([
    fetchItems('/public/articles'),
    fetchItems('/public/weekly-summaries')
  ]);

  const articleRoutes = articles
    .slice(0, SLUG_LIMIT)
    .filter((a) => a?.slug)
    .map((a) => `/articles/${a.slug}`);

  const recapRoutes = recaps
    .slice(0, SLUG_LIMIT)
    .filter((r) => r?.slug)
    .map((r) => `/weekly-recap/${r.slug}`);

  const all = [...staticRoutes, ...articleRoutes, ...recapRoutes];
  writeFileSync(OUT, all.join('\n') + '\n', 'utf8');
  console.log(
    `[prerender] wrote ${all.length} routes (${articleRoutes.length} articles, ${recapRoutes.length} recaps) to ${OUT}`
  );
})();
