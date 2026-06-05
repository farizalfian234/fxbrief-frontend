import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';

import { SeoService } from '../../../../core/services/seo.service';
import { MarkdownService } from '../../../../shared/services/markdown.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb.component';
import { ShareButtonsComponent } from '../../components/share-buttons.component';
import { formatPublishedDate } from '../../util/content-format.util';
import { PublicWeeklyRecapDetail } from '../../models/content.models';
import { WeeklyRecapApiService } from '../../services/weekly-recap-api.service';

const SITE_ORIGIN = 'https://fx-brief.com';

type View = 'loading' | 'ready' | 'notfound';

@Component({
  selector: 'fx-weekly-recap-detail',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, ShareButtonsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (view() === 'loading') {
      <div class="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <div class="animate-pulse">
          <div class="h-3 w-40 rounded bg-surface-muted"></div>
          <div class="mt-6 h-8 w-3/4 rounded bg-surface-muted"></div>
          <div class="mt-6 space-y-3">
            <div class="h-4 w-full rounded bg-surface-muted"></div>
            <div class="h-4 w-full rounded bg-surface-muted"></div>
            <div class="h-4 w-2/3 rounded bg-surface-muted"></div>
          </div>
        </div>
      </div>
    } @else if (view() === 'notfound') {
      <div class="mx-auto max-w-content px-5 py-20 text-center sm:px-8">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent">404</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-navy-900">Recap not found</h1>
        <p class="mx-auto mt-3 max-w-md text-base leading-relaxed text-navy-600">
          This weekly recap may have been moved or unpublished.
        </p>
        <a
          routerLink="/weekly-recap"
          class="mt-6 inline-flex rounded-lg bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
          >Browse all recaps</a
        >
      </div>
    } @else {
      @if (recap(); as r) {
      <article class="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <fx-breadcrumb [items]="crumbs()" />

        <header class="mt-6">
          <p class="text-xs font-semibold uppercase tracking-widest text-accent">
            {{ formatDate(r.weekStart) }} – {{ formatDate(r.weekEnd) }}
          </p>
          <h1 class="mt-3 font-display text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">
            {{ r.title }}
          </h1>
          <p class="mt-3 text-xs text-navy-400">Published {{ formatDate(r.publishedAt) }}</p>
        </header>

        <div
          class="prose-content mt-8 max-w-none text-base leading-relaxed text-navy-700"
          [innerHTML]="body()"
        ></div>

        <div class="mt-10 border-t border-surface-border pt-6">
          <fx-share-buttons [url]="pageUrl()" [title]="r.title" />
        </div>
      </article>
      }
    }
  `,
  styles: [
    `
      :host ::ng-deep .prose-content h2 {
        font-family: 'Sora', sans-serif;
        font-size: 1.4rem;
        font-weight: 600;
        color: #0f2942;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
      }
      :host ::ng-deep .prose-content h3 {
        font-family: 'Sora', sans-serif;
        font-size: 1.15rem;
        font-weight: 600;
        color: #0f2942;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
      }
      :host ::ng-deep .prose-content p {
        margin-bottom: 1rem;
      }
      :host ::ng-deep .prose-content ul,
      :host ::ng-deep .prose-content ol {
        margin: 1rem 0;
        padding-left: 1.5rem;
      }
      :host ::ng-deep .prose-content ul {
        list-style: disc;
      }
      :host ::ng-deep .prose-content ol {
        list-style: decimal;
      }
      :host ::ng-deep .prose-content li {
        margin-bottom: 0.4rem;
      }
      :host ::ng-deep .prose-content a {
        color: #2563eb;
        text-decoration: underline;
      }
      :host ::ng-deep .prose-content strong {
        color: #0f2942;
        font-weight: 600;
      }
      :host ::ng-deep .prose-content blockquote {
        border-left: 3px solid #2563eb;
        padding-left: 1rem;
        color: #4b6075;
        font-style: italic;
        margin: 1.25rem 0;
      }
      :host ::ng-deep .prose-content code {
        background: #eef2f7;
        padding: 0.1rem 0.35rem;
        border-radius: 0.3rem;
        font-size: 0.9em;
      }
      :host ::ng-deep .prose-content pre {
        background: #0f2942;
        color: #e8eef5;
        padding: 1rem;
        border-radius: 0.75rem;
        overflow-x: auto;
        margin: 1.25rem 0;
      }
      :host ::ng-deep .prose-content pre code {
        background: transparent;
        padding: 0;
      }
      :host ::ng-deep .prose-content img {
        border-radius: 0.75rem;
        margin: 1.25rem 0;
        max-width: 100%;
      }
      :host ::ng-deep .prose-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.25rem 0;
        display: block;
        overflow-x: auto;
      }
      :host ::ng-deep .prose-content th,
      :host ::ng-deep .prose-content td {
        border: 1px solid #dde4ec;
        padding: 0.5rem 0.75rem;
        text-align: left;
      }
    `
  ]
})
export class WeeklyRecapDetailComponent implements OnInit {
  private readonly api = inject(WeeklyRecapApiService);
  private readonly seo = inject(SeoService);
  private readonly markdown = inject(MarkdownService);

  @Input() slug?: string;

  readonly view = signal<View>('loading');
  readonly recap = signal<PublicWeeklyRecapDetail | null>(null);
  readonly body = signal<SafeHtml>('');

  readonly formatDate = formatPublishedDate;

  ngOnInit(): void {
    const slug = this.slug;
    if (!slug) {
      this.view.set('notfound');
      return;
    }
    this.api.detail(slug).subscribe({
      next: (r) => this.onRecap(r),
      error: () => {
        this.applyNotFoundSeo();
        this.view.set('notfound');
      }
    });
  }

  pageUrl(): string {
    return `${SITE_ORIGIN}/weekly-recap/${this.slug}`;
  }

  crumbs(): BreadcrumbItem[] {
    const r = this.recap();
    return [
      { label: 'Home', link: '/' },
      { label: 'Weekly Recap', link: '/weekly-recap' },
      { label: r ? r.title : 'Recap' }
    ];
  }

  private onRecap(r: PublicWeeklyRecapDetail): void {
    this.recap.set(r);
    this.body.set(this.markdown.render(r.content));
    this.applySeo(r);
    this.view.set('ready');
  }

  private applySeo(r: PublicWeeklyRecapDetail): void {
    const url = `${SITE_ORIGIN}/weekly-recap/${r.slug}`;
    const description = `FX–Brief weekly forex market recap for ${this.formatDate(
      r.weekStart
    )} – ${this.formatDate(r.weekEnd)}.`;
    this.seo.apply({
      title: r.title,
      description,
      url,
      canonical: url,
      ogType: 'article'
    });
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: r.title,
      description,
      datePublished: r.publishedAt,
      articleSection: 'Weekly Recap',
      mainEntityOfPage: url
    });
  }

  private applyNotFoundSeo(): void {
    this.seo.apply({
      title: 'Recap not found',
      description: 'This weekly recap could not be found.',
      url: this.pageUrl(),
      canonical: this.pageUrl()
    });
  }
}
