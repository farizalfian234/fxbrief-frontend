import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

/**
 * Renders Markdown to sanitized HTML for the article editor's live preview.
 * `marked` produces the HTML; Angular's DomSanitizer strips anything unsafe
 * before it is bound with [innerHTML], so a draft containing a stray script or
 * event-handler attribute cannot execute in the preview pane.
 */
@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private readonly sanitizer = inject(DomSanitizer);

  render(markdown: string): SafeHtml {
    const html = marked.parse(markdown ?? '', { async: false }) as string;
    return this.sanitizer.sanitize(1, html) ?? '';
  }
}
