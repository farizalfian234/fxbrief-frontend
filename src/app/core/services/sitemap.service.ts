import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { SitemapEntry } from '../../shared/models/sitemap-entry.model';

/**
 * Fetches dynamic sitemap rows from the backend and renders a sitemap XML
 * document. Static public routes are folded in here so the generated
 * sitemap.xml is complete without the backend having to know about frontend
 * routes. Consumed by the build-time generator (tools/generate-sitemap.mjs);
 * the same shaping logic is reused if a runtime server route is added later.
 */
@Injectable({ providedIn: 'root' })
export class SitemapService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly staticEntries: SitemapEntry[] = [
    { path: '/', lastModified: '', changeFreq: 'weekly', priority: 1.0 },
    { path: '/about', lastModified: '', changeFreq: 'monthly', priority: 0.6 },
    { path: '/privacy', lastModified: '', changeFreq: 'yearly', priority: 0.3 },
    { path: '/terms', lastModified: '', changeFreq: 'yearly', priority: 0.3 },
    { path: '/support', lastModified: '', changeFreq: 'monthly', priority: 0.5 },
    { path: '/articles', lastModified: '', changeFreq: 'daily', priority: 0.8 },
    { path: '/weekly-recap', lastModified: '', changeFreq: 'weekly', priority: 0.8 }
  ];

  fetchEntries(): Observable<SitemapEntry[]> {
    return this.http
      .get<ApiResponse<SitemapEntry[]>>(`${this.baseUrl}/public/sitemap-entries`)
      .pipe(map((res) => res.data ?? []));
  }

  buildXml(dynamicEntries: SitemapEntry[], origin: string): string {
    const all = [...this.staticEntries, ...dynamicEntries];
    const urls = all
      .map((entry) => {
        const loc = `${origin}${entry.path}`;
        const lastmod = entry.lastModified
          ? `\n    <lastmod>${entry.lastModified}</lastmod>`
          : '';
        return `  <url>\n    <loc>${loc}</loc>${lastmod}\n    <changefreq>${entry.changeFreq}</changefreq>\n    <priority>${entry.priority.toFixed(1)}</priority>\n  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  }
}
