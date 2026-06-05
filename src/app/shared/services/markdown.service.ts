import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface RenderedMarkdown {
  html: SafeHtml;
  toc: TocEntry[];
}

/**
 * Renders Markdown to sanitized HTML. `marked` produces the HTML; Angular's
 * DomSanitizer strips anything unsafe before it is bound with [innerHTML], so
 * content containing a stray script or event-handler attribute cannot execute.
 * Shared by the admin article editor's live preview and the public article and
 * weekly-recap reader pages.
 */
@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private readonly sanitizer = inject(DomSanitizer);

  render(markdown: string): SafeHtml {
    const html = marked.parse(markdown ?? '', { async: false }) as string;
    return this.sanitizer.sanitize(1, html) ?? '';
  }

  /**
   * Renders Markdown and, in the same pass, gives each H2/H3 a stable id and
   * collects a table of contents. Ids are derived from the heading text and
   * de-duplicated, so in-page anchor links resolve unambiguously.
   */
  renderWithToc(markdown: string): RenderedMarkdown {
    const raw = marked.parse(markdown ?? '', { async: false }) as string;
    const toc: TocEntry[] = [];
    const seen = new Map<string, number>();

    const withIds = raw.replace(
      /<(h[23])>([\s\S]*?)<\/\1>/g,
      (_match, tag: string, inner: string) => {
        const text = inner.replace(/<[^>]+>/g, '').trim();
        const id = this.uniqueSlug(text, seen);
        toc.push({ id, text, level: tag === 'h2' ? 2 : 3 });
        return `<${tag} id="${id}">${inner}</${tag}>`;
      }
    );

    return {
      html: this.sanitizer.sanitize(1, withIds) ?? '',
      toc
    };
  }

  private uniqueSlug(text: string, seen: Map<string, number>): string {
    const base =
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  }
}
