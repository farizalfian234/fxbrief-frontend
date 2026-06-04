import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoTags {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  /** Defaults to 'website'. Public content pages may pass 'article'. */
  ogType?: string;
  /** Absolute canonical URL for this route. */
  canonical?: string;
}

const SITE_ORIGIN = 'https://fx-brief.com';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/assets/images/logo-primary.png`;
const STRUCTURED_DATA_ID = 'fx-structured-data';

/**
 * Wrapper over Angular's Title/Meta plus direct head management for the tags
 * Meta does not cover (canonical link, JSON-LD). All DOM writes go through the
 * injected DOCUMENT so they run correctly during the prerender pass as well as
 * in the browser. Defaults mirror the static tags in index.html.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  apply(tags: SeoTags): void {
    const fullTitle = tags.title.includes('FX–Brief') ? tags.title : `${tags.title} | FX–Brief`;
    this.title.setTitle(fullTitle);

    this.set('description', tags.description);
    this.setProperty('og:type', tags.ogType ?? 'website');
    this.setProperty('og:title', fullTitle);
    this.setProperty('og:description', tags.description);
    this.setProperty('og:image', tags.image ?? DEFAULT_IMAGE);
    this.setProperty('og:url', tags.url);
    this.set('twitter:card', 'summary_large_image');
    this.set('twitter:title', fullTitle);
    this.set('twitter:description', tags.description);
    this.set('twitter:image', tags.image ?? DEFAULT_IMAGE);

    this.setCanonical(tags.canonical ?? tags.url);
  }

  /** Sets or updates the document's canonical link. */
  setCanonical(url?: string): void {
    if (!url) {
      return;
    }
    const head = this.doc.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Injects a single JSON-LD block, replacing any previously set by this
   * service. Used for the Organization schema on the landing page.
   */
  setStructuredData(data: Record<string, unknown>): void {
    const head = this.doc.head;
    let script = head.querySelector<HTMLScriptElement>(`script#${STRUCTURED_DATA_ID}`);
    if (!script) {
      script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.id = STRUCTURED_DATA_ID;
      head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
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
