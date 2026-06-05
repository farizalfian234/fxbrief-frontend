import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';

import { SeoService } from '../../../../core/services/seo.service';
import { MarkdownService, TocEntry } from '../../../../shared/services/markdown.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb.component';
import { ShareButtonsComponent } from '../../components/share-buttons.component';
import { categoryLabel, formatPublishedDate } from '../../util/content-format.util';
import { PublicArticleDetail, PublicArticleListItem } from '../../models/content.models';
import { ArticleApiService } from '../../services/article-api.service';

const SITE_ORIGIN = 'https://fx-brief.com';

type View = 'loading' | 'ready' | 'notfound';

@Component({
  selector: 'fx-article-detail',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, ShareButtonsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (view() === 'loading') {
      <div class="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <div class="animate-pulse">
          <div class="h-3 w-40 rounded bg-surface-muted"></div>
          <div class="mt-6 h-8 w-3/4 rounded bg-surface-muted"></div>
          <div class="mt-4 aspect-video w-full rounded-2xl bg-surface-muted"></div>
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
        <h1 class="mt-2 font-display text-3xl font-bold text-navy-900">Article not found</h1>
        <p class="mx-auto mt-3 max-w-md text-base leading-relaxed text-navy-600">
          This article may have been moved or unpublished.
        </p>
        <a
          routerLink="/articles"
          class="mt-6 inline-flex rounded-lg bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
          >Browse all articles</a
        >
      </div>
    } @else {
      @if (article(); as a) {
      <article class="mx-auto max-w-content px-5 py-10 sm:px-8 sm:py-14">
        <fx-breadcrumb [items]="crumbs()" />

        <header class="mt-6 max-w-3xl">
          <div class="flex items-center gap-2">
            <span
              class="inline-flex rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-navy-700"
              >{{ label(a.category) }}</span
            >
            <span class="text-xs text-navy-400">{{ a.readingTimeMinutes }} min read</span>
            <span class="text-xs text-navy-300" aria-hidden="true">·</span>
            <span class="text-xs text-navy-400">{{ formatDate(a.publishedAt) }}</span>
          </div>
          <h1 class="mt-3 font-display text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">
            {{ a.title }}
          </h1>
        </header>

        @if (a.featuredImageUrl) {
          <img
            [src]="a.featuredImageUrl"
            [alt]="a.title"
            class="mt-8 aspect-video w-full rounded-2xl object-cover"
          />
        }

        <div class="mt-10 md:grid md:grid-cols-[1fr_220px] md:gap-10">
          <div
            class="prose-content max-w-none text-base leading-relaxed text-navy-700"
            [innerHTML]="body()"
          ></div>

          @if (toc().length) {
            <aside class="hidden md:block">
              <div class="sticky top-24">
                <p class="text-xs font-semibold uppercase tracking-widest text-navy-400">
                  On this page
                </p>
                <ul class="mt-3 flex flex-col gap-2 border-l border-surface-border">
                  @for (entry of toc(); track entry.id) {
                    <li [class.pl-4]="entry.level === 2" [class.pl-8]="entry.level === 3">
                      <a
                        [href]="'#' + entry.id"
                        class="-ml-px block border-l-2 border-transparent text-sm leading-snug text-navy-500 transition hover:border-accent hover:text-accent"
                        >{{ entry.text }}</a
                      >
                    </li>
                  }
                </ul>
              </div>
            </aside>
          }
        </div>

        <div class="mt-10 border-t border-surface-border pt-6">
          <fx-share-buttons [url]="pageUrl()" [title]="a.title" />
        </div>

        @if (related().length) {
          <section class="mt-14 border-t border-surface-border pt-10">
            <h2 class="font-display text-xl font-semibold text-navy-900">Related articles</h2>
            <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              @for (r of related(); track r.id) {
                <a
                  [routerLink]="['/articles', r.slug]"
                  class="group flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-white transition hover:shadow-md"
                >
                  @if (r.featuredImageUrl) {
                    <img
                      [src]="r.featuredImageUrl"
                      [alt]="r.title"
                      loading="lazy"
                      class="aspect-video w-full object-cover"
                    />
                  }
                  <div class="flex flex-1 flex-col p-4">
                    <span class="text-xs text-navy-400">{{ r.readingTimeMinutes }} min read</span>
                    <h3
                      class="mt-2 font-display text-base font-semibold leading-snug text-navy-900 transition group-hover:text-accent"
                    >
                      {{ r.title }}
                    </h3>
                  </div>
                </a>
              }
            </div>
          </section>
        }
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
        scroll-margin-top: 6rem;
      }
      :host ::ng-deep .prose-content h3 {
        font-family: 'Sora', sans-serif;
        font-size: 1.15rem;
        font-weight: 600;
        color: #0f2942;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        scroll-margin-top: 6rem;
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
export class ArticleDetailComponent implements OnInit {
  private readonly api = inject(ArticleApiService);
  private readonly seo = inject(SeoService);
  private readonly markdown = inject(MarkdownService);

  @Input() slug?: string;

  readonly view = signal<View>('loading');
  readonly article = signal<PublicArticleDetail | null>(null);
  readonly body = signal<SafeHtml>('');
  readonly toc = signal<TocEntry[]>([]);
  readonly related = signal<PublicArticleListItem[]>([]);

  readonly label = categoryLabel;
  readonly formatDate = formatPublishedDate;

  ngOnInit(): void {
    const slug = this.slug;
    if (!slug) {
      this.view.set('notfound');
      return;
    }
    this.api.detail(slug).subscribe({
      next: (a) => this.onArticle(a),
      error: () => {
        // 404 (unpublished/unknown slug) and transient backend errors both land
        // on the not-found shell rather than a blank page; the listing stays
        // reachable from there.
        this.applyNotFoundSeo();
        this.view.set('notfound');
      }
    });
  }

  pageUrl(): string {
    return `${SITE_ORIGIN}/articles/${this.slug}`;
  }

  crumbs(): BreadcrumbItem[] {
    const a = this.article();
    return [
      { label: 'Home', link: '/' },
      { label: 'Articles', link: '/articles' },
      { label: a ? a.title : 'Article' }
    ];
  }

  private onArticle(a: PublicArticleDetail): void {
    this.article.set(a);
    const rendered = this.markdown.renderWithToc(a.content);
    this.body.set(rendered.html);
    this.toc.set(rendered.toc);
    this.applySeo(a);
    this.loadRelated(a);
    this.view.set('ready');
  }

  private applySeo(a: PublicArticleDetail): void {
    const url = `${SITE_ORIGIN}/articles/${a.slug}`;
    const description = a.seoDescription ?? a.excerpt ?? a.title;
    this.seo.apply({
      title: a.seoTitle ?? a.title,
      description: description ?? undefined,
      image: a.featuredImageUrl ?? undefined,
      url,
      canonical: url,
      ogType: 'article'
    });
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: description ?? undefined,
      image: a.featuredImageUrl ?? undefined,
      datePublished: a.publishedAt,
      articleSection: this.label(a.category),
      mainEntityOfPage: url
    });
  }

  private applyNotFoundSeo(): void {
    this.seo.apply({
      title: 'Article not found',
      description: 'This article could not be found.',
      url: this.pageUrl(),
      canonical: this.pageUrl()
    });
  }

  private loadRelated(a: PublicArticleDetail): void {
    this.api.list({ category: a.category }).subscribe({
      next: (page) => {
        const others = page.items.filter((i) => i.slug !== a.slug).slice(0, 3);
        this.related.set(others);
      },
      error: () => this.related.set([])
    });
  }
}
