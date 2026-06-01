import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoTags {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

const DEFAULT_IMAGE = 'https://fx-brief.com/assets/images/logo-primary.png';

/**
 * Thin wrapper over Angular's Title/Meta for setting per-route document title
 * and OpenGraph/Twitter tags. Pages call apply() in their constructor or a
 * resolver. Defaults mirror the static tags in index.html.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  apply(tags: SeoTags): void {
    const fullTitle = tags.title.includes('FX–Brief') ? tags.title : `${tags.title} | FX–Brief`;
    this.title.setTitle(fullTitle);

    this.set('description', tags.description);
    this.setProperty('og:title', fullTitle);
    this.setProperty('og:description', tags.description);
    this.setProperty('og:image', tags.image ?? DEFAULT_IMAGE);
    this.setProperty('og:url', tags.url);
    this.set('twitter:title', fullTitle);
    this.set('twitter:description', tags.description);
    this.set('twitter:image', tags.image ?? DEFAULT_IMAGE);
  }

  private set(name: string, content?: string): void {
    if (content) {
      this.meta.updateTag({ name, content });
    }
  }

  private setProperty(property: string, content?: string): void {
    if (content) {
      this.meta.updateTag({ property, content });
    }
  }
}
