import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { SeoService } from '../../../../core/services/seo.service';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AdminArticleApiService } from '../../services/admin-article-api.service';
import { AdminPaginationComponent } from '../../components/admin-pagination.component';
import {
  ARTICLE_CATEGORIES,
  ARTICLE_STATUSES,
  ArticleCategory,
  ArticleListItem,
  ArticlePage,
  ArticleStatus
} from '../../models/article.models';
import { categoryLabel, formatTimestamp, statusBadgeClass } from '../../util/admin-format.util';

type View = 'loading' | 'ready';

@Component({
  selector: 'fx-admin-articles',
  standalone: true,
  imports: [FormsModule, RouterLink, AdminPaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-bold text-navy-900">Articles</h1>
      <a
        routerLink="/admin/articles/new"
        class="inline-flex items-center gap-1.5 rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
      >
        <i class="pi pi-plus text-xs"></i> New article
      </a>
    </div>

    @if (banner(); as msg) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ msg }}</p>
    }
    @if (notice(); as msg) {
      <p class="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{{ msg }}</p>
    }

    <!-- Filters -->
    <div class="mt-6 flex flex-col gap-3 sm:flex-row">
      <label class="block sm:w-48">
        <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">Status</span>
        <select
          [(ngModel)]="status"
          (ngModelChange)="applyFilters()"
          class="mt-1 w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
        >
          <option [ngValue]="undefined">All statuses</option>
          @for (s of statuses; track s) {
            <option [ngValue]="s">{{ s }}</option>
          }
        </select>
      </label>
      <label class="block sm:w-56">
        <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">Category</span>
        <select
          [(ngModel)]="category"
          (ngModelChange)="applyFilters()"
          class="mt-1 w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
        >
          <option [ngValue]="undefined">All categories</option>
          @for (c of categories; track c) {
            <option [ngValue]="c">{{ categoryLabel(c) }}</option>
          }
        </select>
      </label>
    </div>

    @if (view() === 'loading') {
      <div class="mt-6 h-64 animate-pulse rounded-2xl bg-white"></div>
    }

    @if (view() === 'ready' && page(); as pg) {
      @if (!pg.items.length) {
        <div class="mt-6 rounded-2xl border border-surface-border bg-white p-8 text-center">
          <p class="text-sm font-semibold text-navy-900">No articles</p>
          <p class="mt-1 text-sm text-navy-500">Create your first article to get started.</p>
        </div>
      } @else {
        <div class="mt-6 overflow-x-auto rounded-2xl border border-surface-border bg-white">
          <table class="w-full min-w-[860px] text-left text-sm">
            <thead class="border-b border-surface-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-navy-500">
              <tr>
                <th class="px-4 py-3">Title</th>
                <th class="px-4 py-3">Category</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Published</th>
                <th class="px-4 py-3">Reading</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (a of pg.items; track a.id) {
                <tr class="border-b border-surface-border last:border-0 align-top">
                  <td class="px-4 py-3 text-navy-800">
                    <div class="font-medium">{{ a.title }}</div>
                    <div class="text-xs text-navy-400">/{{ a.slug }}</div>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-navy-600">{{ categoryLabel(a.category) }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold" [class]="badge(a.status)">
                      {{ a.status }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-navy-600">{{ formatTimestamp(a.publishedAt) }}</td>
                  <td class="whitespace-nowrap px-4 py-3 text-navy-600">{{ a.readingTimeMinutes }} min</td>
                  <td class="whitespace-nowrap px-4 py-3 text-right">
                    <div class="flex flex-wrap justify-end gap-2">
                      <a
                        [routerLink]="['/admin/articles', a.id]"
                        class="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-surface-muted"
                      >
                        Edit
                      </a>
                      @if (a.status !== 'PUBLISHED') {
                        <button
                          type="button"
                          [disabled]="busyId() === a.id"
                          (click)="publish(a)"
                          class="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:opacity-50"
                        >
                          Publish
                        </button>
                      }
                      @if (a.status !== 'ARCHIVED') {
                        <button
                          type="button"
                          [disabled]="busyId() === a.id"
                          (click)="archive(a)"
                          class="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-navy-600 transition hover:bg-surface-muted disabled:opacity-50"
                        >
                          Archive
                        </button>
                      }
                      @if (a.status === 'DRAFT') {
                        <button
                          type="button"
                          [disabled]="busyId() === a.id"
                          (click)="remove(a)"
                          class="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <fx-admin-pagination [page]="pg.page" [totalPages]="pg.totalPages" (change)="goTo($event)" />
      }
    }
  `
})
export class AdminArticlesComponent {
  private readonly api = inject(AdminArticleApiService);

  readonly view = signal<View>('loading');
  readonly page = signal<ArticlePage | null>(null);
  readonly banner = signal('');
  readonly notice = signal('');
  readonly busyId = signal<number | null>(null);

  readonly statuses = ARTICLE_STATUSES;
  readonly categories = ARTICLE_CATEGORIES;
  readonly categoryLabel = categoryLabel;
  readonly formatTimestamp = formatTimestamp;

  status?: ArticleStatus;
  category?: ArticleCategory;

  constructor() {
    inject(SeoService).apply({ title: 'Articles' });
    this.load(1);
  }

  private load(page: number): void {
    this.view.set('loading');
    this.api.list({ page, status: this.status, category: this.category }).subscribe({
      next: (pg) => {
        this.page.set(pg);
        this.view.set('ready');
      },
      error: (err) => {
        this.banner.set(messageForError(err));
        this.view.set('ready');
      }
    });
  }

  applyFilters(): void {
    this.banner.set('');
    this.notice.set('');
    this.load(1);
  }

  goTo(page: number): void {
    if (page < 1) {
      return;
    }
    this.load(page);
  }

  badge(status: ArticleStatus): string {
    return statusBadgeClass(status);
  }

  publish(a: ArticleListItem): void {
    this.run(a.id, this.api.publish(a.id), 'Article published.');
  }

  archive(a: ArticleListItem): void {
    this.run(a.id, this.api.archive(a.id), 'Article archived.');
  }

  remove(a: ArticleListItem): void {
    this.run(a.id, this.api.delete(a.id), 'Article deleted.');
  }

  private run(id: number, call: Observable<unknown>, success: string): void {
    this.notice.set('');
    this.banner.set('');
    this.busyId.set(id);
    call.subscribe({
      next: () => {
        this.busyId.set(null);
        this.notice.set(success);
        this.load(this.page()?.page ?? 1);
      },
      error: (err: unknown) => {
        this.busyId.set(null);
        this.banner.set(messageForError(err));
      }
    });
  }
}
