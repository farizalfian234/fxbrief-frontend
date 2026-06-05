import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal
} from '@angular/core';

/**
 * Social share row for content detail pages: share to X/Twitter and copy the
 * canonical link. No Facebook. The copy action uses the Clipboard API when it
 * is available and falls back to a hidden textarea + execCommand otherwise;
 * both are guarded so the component renders safely during the prerender pass,
 * where no browser clipboard exists.
 */
@Component({
  selector: 'fx-share-buttons',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-medium text-navy-500">Share</span>
      <a
        [href]="tweetHref()"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-surface-muted"
        aria-label="Share on X"
      >
        <i class="pi pi-twitter text-[0.85rem]"></i>
        <span>X</span>
      </a>
      <button
        type="button"
        (click)="copyLink()"
        class="inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-surface-muted"
        aria-label="Copy link"
      >
        <i class="pi pi-link text-[0.85rem]"></i>
        <span>{{ copied() ? 'Copied' : 'Copy link' }}</span>
      </button>
    </div>
  `
})
export class ShareButtonsComponent {
  private readonly doc = inject(DOCUMENT);

  @Input({ required: true }) url = '';
  @Input() title = '';

  readonly copied = signal(false);

  tweetHref(): string {
    const text = encodeURIComponent(this.title);
    const u = encodeURIComponent(this.url);
    return `https://twitter.com/intent/tweet?text=${text}&url=${u}`;
  }

  copyLink(): void {
    const win = this.doc.defaultView;
    const nav = win?.navigator;
    if (nav?.clipboard?.writeText) {
      nav.clipboard.writeText(this.url).then(
        () => this.flagCopied(),
        () => this.fallbackCopy()
      );
      return;
    }
    this.fallbackCopy();
  }

  private fallbackCopy(): void {
    try {
      const area = this.doc.createElement('textarea');
      area.value = this.url;
      area.setAttribute('readonly', '');
      area.style.position = 'absolute';
      area.style.left = '-9999px';
      this.doc.body.appendChild(area);
      area.select();
      this.doc.execCommand('copy');
      this.doc.body.removeChild(area);
      this.flagCopied();
    } catch {
      // Clipboard unavailable; leave the label unchanged.
    }
  }

  private flagCopied(): void {
    this.copied.set(true);
    const win = this.doc.defaultView;
    win?.setTimeout(() => this.copied.set(false), 2000);
  }
}
