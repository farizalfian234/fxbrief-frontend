import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { SeoService } from '../../../../core/services/seo.service';
import { messageForError } from '../../../../shared/util/api-error.util';
import { ContentPaginationComponent } from '../../components/content-pagination.component';
import { categoryLabel, formatPublishedDate } from '../../util/content-format.util';
import {
  ArticleCategory,
  PublicArticleListItem,
  PublicArticlePage
} from '../../models/content.models';
import { ArticleApiService } from '../../services/article-api.service';

const SITE_ORIGIN = 'https://fx-brief.com';

type View = 'loading' | 'ready' | 'error';

@Component({
  selector: 'fx-article-list',
  standalone: true,
  imports: [FormsModule, RouterLink, ContentPaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
      <header class="max-w-3xl">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent">Insights</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
          Forex Education & Market Insights
        </h1>
        <p class="mt-3 text-base leading-relaxed text-navy-600">
          Guides, market context, and trading concepts from the FX–Brief desk.
        </p>
      </header>

      @if (categories().length) {
        <div class="mt-8 flex items-center gap-3">
          <label for="category" class="text-sm font-medium text-navy-700">Category</label>
          <select
            id="category"
            [(ngModel)]="selectedCategory"
            (ngModelChange)="onCategoryChange($event)"
            class="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-navy-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option [ngValue]="null">All categories</option>
            @for (c of categories(); track c) {
              <option [ngValue]="c">{{ label(c) }}</option>
            }
          </select>
        </div>
      }

      @if (view() === 'loading') {
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (s of skeletons; track s) {
            <div class="animate-pulse rounded-2xl border border-surface-border bg-white p-4">
              <div class="aspect-video w-full rounded-xl bg-surface-muted"></div>
              <div class="mt-4 h-3 w-20 rounded bg-surface-muted"></div>
              <div class="mt-3 h-4 w-3/4 rounded bg-surface-muted"></div>
              <div class="mt-2 h-3 w-full rounded bg-surface-muted"></div>
            </div>
          }
        </div>
      } @else if (view() === 'error') {
        <div class="mt-10 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {{ banner() }}
        </div>
      } @else if (!items().length) {
        <div
          class="mt-10 rounded-2xl border border-surface-border bg-surface-muted p-8 text-center text-navy-600"
        >
          <p class="text-base font-medium text-navy-900">No articles yet</p>
          <p class="mt-1 text-sm">
            {{
              selectedCategory
                ? 'No articles in this category yet. Try another.'
                : 'New insights are on the way — check back soon.'
            }}
          </p>
        </div>
      } @else {
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (article of items(); track article.id) {
            <a
              [routerLink]="['/articles', article.slug]"
              class="group flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-white transition hover:shadow-md"
            >
              @if (article.featuredImageUrl) {
                <img
                  [src]="article.featuredImageUrl"
                  [alt]="article.title"
                  loading="lazy"
                  class="aspect-video w-full object-cover"
                />
              } @else {
                <div
                  class="flex aspect-video w-full items-center justify-center bg-navy-50 text-navy-300"
                >
                  <i class="pi pi-image text-2xl"></i>
                </div>
              }
              <div class="flex flex-1 flex-col p-5">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-navy-700"
                    >{{ label(article.category) }}</span
                  >
                  <span class="text-xs text-navy-400"
                    >{{ article.readingTimeMinutes }} min read</span
                  >
                </div>
                <h2
                  class="mt-3 font-display text-lg font-semibold leading-snug text-navy-900 transition group-hover:text-accent"
                >
                  {{ article.title }}
                </h2>
                @if (article.excerpt) {
                  <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-navy-600">
                    {{ article.excerpt }}
                  </p>
                }
                <p class="mt-4 text-xs text-navy-400">{{ formatDate(article.publishedAt) }}</p>
              </div>
            </a>
          }
        </div>

        <fx-content-pagination
          [page]="page()"
          [totalPages]="totalPages()"
          (change)="goToPage($event)"
        />
      }
    </section>
  `
})
export class ArticleListComponent implements OnInit {
  private readonly api = inject(ArticleApiService);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly skeletons = [0, 1, 2, 3, 4, 5];

  readonly view = signal<View>('loading');
  readonly banner = signal('');
  readonly items = signal<PublicArticleListItem[]>([]);
  readonly categories = signal<ArticleCategory[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(1);

  selectedCategory: ArticleCategory | null = null;

  readonly label = categoryLabel;
  readonly formatDate = formatPublishedDate;

  ngOnInit(): void {
    this.seo.apply({
      title: 'FX–Brief — Forex Education & Market Insights',
      description:
        'Forex education, market context, and trading concepts from the FX–Brief desk. Clear, practical insights for serious traders.',
      url: `${SITE_ORIGIN}/articles`,
      canonical: `${SITE_ORIGIN}/articles`
    });

    const qp = this.route.snapshot.queryParamMap;
    const cat = qp.get('category');
    const pageParam = Number(qp.get('page'));
    this.selectedCategory = (cat as ArticleCategory) || null;
    this.page.set(Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1);

    this.api.categories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => this.categories.set([])
    });

    this.load();
  }

  onCategoryChange(value: ArticleCategory | null): void {
    this.selectedCategory = value;
    this.page.set(1);
    this.syncUrl();
    this.load();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.syncUrl();
    this.load();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory ?? null,
        page: this.page() > 1 ? this.page() : null
      },
      queryParamsHandling: 'merge'
    });
  }

  private load(): void {
    this.view.set('loading');
    this.api
      .list({ page: this.page(), category: this.selectedCategory ?? undefined })
      .subscribe({
        next: (res: PublicArticlePage) => {
          this.items.set(res.items);
          this.page.set(res.page);
          this.totalPages.set(res.totalPages);
          this.view.set('ready');
          this.setItemListSchema(res.items);
        },
        error: (err) => {
          this.banner.set(messageForError(err));
          this.view.set('error');
        }
      });
  }

  private setItemListSchema(items: PublicArticleListItem[]): void {
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: items.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_ORIGIN}/articles/${a.slug}`,
        name: a.title
      }))
    });
  }
}
