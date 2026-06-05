import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { SeoService } from '../../../../core/services/seo.service';
import { messageForError } from '../../../../shared/util/api-error.util';
import { ContentPaginationComponent } from '../../components/content-pagination.component';
import { formatPublishedDate } from '../../util/content-format.util';
import {
  PublicWeeklyRecapListItem,
  PublicWeeklyRecapPage
} from '../../models/content.models';
import { WeeklyRecapApiService } from '../../services/weekly-recap-api.service';

const SITE_ORIGIN = 'https://fx-brief.com';

type View = 'loading' | 'ready' | 'error';

@Component({
  selector: 'fx-weekly-recap-list',
  standalone: true,
  imports: [RouterLink, ContentPaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
      <header class="max-w-3xl">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent">Weekly Recap</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
          Weekly Forex Market Recaps
        </h1>
        <p class="mt-3 text-base leading-relaxed text-navy-600">
          A look back at each trading week — the moves that mattered and the context behind them.
        </p>
      </header>

      @if (view() === 'loading') {
        <div class="mt-10 flex flex-col gap-4">
          @for (s of skeletons; track s) {
            <div class="animate-pulse rounded-2xl border border-surface-border bg-white p-5">
              <div class="h-3 w-40 rounded bg-surface-muted"></div>
              <div class="mt-3 h-4 w-2/3 rounded bg-surface-muted"></div>
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
          <p class="text-base font-medium text-navy-900">No recaps yet</p>
          <p class="mt-1 text-sm">The first weekly recap will appear here soon.</p>
        </div>
      } @else {
        <div class="mt-10 flex flex-col gap-4">
          @for (recap of items(); track recap.id) {
            <a
              [routerLink]="['/weekly-recap', recap.slug]"
              class="group rounded-2xl border border-surface-border bg-white p-5 transition hover:shadow-md sm:p-6"
            >
              <p class="text-xs font-semibold uppercase tracking-wide text-accent">
                {{ formatDate(recap.weekStart) }} – {{ formatDate(recap.weekEnd) }}
              </p>
              <h2
                class="mt-2 font-display text-lg font-semibold leading-snug text-navy-900 transition group-hover:text-accent sm:text-xl"
              >
                {{ recap.title }}
              </h2>
              @if (recap.excerpt) {
                <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-navy-600">
                  {{ recap.excerpt }}
                </p>
              }
              <p class="mt-3 text-xs text-navy-400">
                Published {{ formatDate(recap.publishedAt) }}
              </p>
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
export class WeeklyRecapListComponent implements OnInit {
  private readonly api = inject(WeeklyRecapApiService);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly skeletons = [0, 1, 2, 3];

  readonly view = signal<View>('loading');
  readonly banner = signal('');
  readonly items = signal<PublicWeeklyRecapListItem[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(1);

  readonly formatDate = formatPublishedDate;

  ngOnInit(): void {
    this.seo.apply({
      title: 'FX–Brief — Weekly Forex Market Recaps',
      description:
        'Weekly forex market recaps from FX–Brief: the key moves, levels, and macro context from each trading week.',
      url: `${SITE_ORIGIN}/weekly-recap`,
      canonical: `${SITE_ORIGIN}/weekly-recap`
    });

    const pageParam = Number(this.route.snapshot.queryParamMap.get('page'));
    this.page.set(Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1);

    this.load();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge'
    });
    this.load();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private load(): void {
    this.view.set('loading');
    this.api.list({ page: this.page() }).subscribe({
      next: (res: PublicWeeklyRecapPage) => {
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

  private setItemListSchema(items: PublicWeeklyRecapListItem[]): void {
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: items.map((r, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_ORIGIN}/weekly-recap/${r.slug}`,
        name: r.title
      }))
    });
  }
}
