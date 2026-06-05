import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SeoService } from '../../../../core/services/seo.service';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminPaginationComponent } from '../../components/admin-pagination.component';
import { UsagePage, UsageRow } from '../../models/admin.models';
import { formatTimestamp, planBadgeClass } from '../../util/admin-format.util';

type View = 'loading' | 'ready';
type SortKey = 'date' | 'user';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'fx-admin-usage',
  standalone: true,
  imports: [FormsModule, AdminPaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="font-display text-2xl font-bold text-navy-900">Usage Overview</h1>

    @if (banner(); as msg) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ msg }}</p>
    }

    <!-- Filters -->
    <div class="mt-6 rounded-2xl border border-surface-border bg-white p-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label class="block">
          <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">From</span>
          <input
            type="date"
            [(ngModel)]="from"
            [attr.data-empty]="!from"
            data-placeholder="Any start date"
            class="mt-1 block w-full min-w-0 appearance-none rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
        <label class="block">
          <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">To</span>
          <input
            type="date"
            [(ngModel)]="to"
            [attr.data-empty]="!to"
            data-placeholder="Any end date"
            class="mt-1 block w-full min-w-0 appearance-none rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
        <label class="block">
          <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">User</span>
          <input
            type="text"
            [(ngModel)]="user"
            placeholder="name or email"
            class="mt-1 block w-full min-w-0 rounded-lg border border-surface-border px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
        <div class="flex items-end gap-2">
          <button
            type="button"
            (click)="applyFilters()"
            class="inline-flex flex-1 items-center justify-center rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
          >
            Apply
          </button>
          <button
            type="button"
            (click)="clearFilters()"
            class="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-navy-700 transition hover:bg-surface-muted"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    @if (view() === 'loading') {
      <div class="mt-6 h-64 animate-pulse rounded-2xl bg-white"></div>
    }

    @if (view() === 'ready' && page(); as pg) {
      @if (!pg.items.length) {
        <div class="mt-6 rounded-2xl border border-surface-border bg-white p-8 text-center">
          <p class="text-sm font-semibold text-navy-900">No usage records</p>
          <p class="mt-1 text-sm text-navy-500">Try widening the date range or clearing filters.</p>
        </div>
      } @else {
        <div class="mt-6 overflow-x-auto rounded-2xl border border-surface-border bg-white">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="border-b border-surface-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-navy-500">
              <tr>
                <th class="px-4 py-3">
                  <button type="button" class="inline-flex items-center gap-1" (click)="sortBy('date')">
                    Date {{ sortIndicator('date') }}
                  </button>
                </th>
                <th class="px-4 py-3">
                  <button type="button" class="inline-flex items-center gap-1" (click)="sortBy('user')">
                    User {{ sortIndicator('user') }}
                  </button>
                </th>
                <th class="px-4 py-3">Plan</th>
                <th class="px-4 py-3">Counted</th>
                <th class="px-4 py-3">Generated at</th>
              </tr>
            </thead>
            <tbody>
              @for (row of sortedItems(); track row.reportId) {
                <tr class="border-b border-surface-border last:border-0">
                  <td class="whitespace-nowrap px-4 py-3 text-navy-700">{{ row.forexMarketDate }}</td>
                  <td class="px-4 py-3 text-navy-800">
                    <div class="font-medium">{{ row.userName }}</div>
                    <div class="text-xs text-navy-500">{{ row.userEmail }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold" [class]="planClass(row)">
                      {{ row.planAtGeneration }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    @if (row.countedAgainstLimit) {
                      <span class="text-xs font-semibold text-navy-700">Yes</span>
                    } @else {
                      <span class="text-xs font-semibold text-navy-400">No</span>
                    }
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-navy-600">
                    {{ formatTimestamp(row.generatedAt) }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <p class="mt-2 text-xs text-navy-400">
          Sorting applies to the current page of {{ pg.items.length }} of {{ pg.totalCount }} records.
        </p>

        <fx-admin-pagination [page]="pg.page" [totalPages]="pg.totalPages" (change)="goTo($event)" />
      }
    }
  `,
  styles: [
    `
      /* iOS Safari sizes type=date to its content, so w-full alone leaves the
         control narrow inside its field. Force it to fill the container, and
         restore a consistent height + a faint placeholder when empty (appearance:
         none strips the native height and dd/mm/yyyy placeholder). */
      input[type='date'] {
        width: 100%;
        box-sizing: border-box;
        min-height: 38px;
        -webkit-appearance: none;
        appearance: none;
      }
      input[type='date']::-webkit-date-and-time-value {
        text-align: left;
        margin: 0;
      }
      input[type='date'][data-empty='true']::before {
        content: attr(data-placeholder);
        color: #94a3b8;
      }
    `
  ]
})
export class AdminUsageComponent {
  private readonly api = inject(AdminApiService);

  readonly view = signal<View>('loading');
  readonly page = signal<UsagePage | null>(null);
  readonly banner = signal('');

  from = '';
  to = '';
  user = '';

  readonly sortKey = signal<SortKey>('date');
  readonly sortDir = signal<SortDir>('desc');

  readonly formatTimestamp = formatTimestamp;

  readonly sortedItems = computed(() => {
    const pg = this.page();
    if (!pg) {
      return [] as UsageRow[];
    }
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...pg.items].sort((a, b) => {
      let cmp: number;
      if (key === 'user') {
        cmp = a.userName.localeCompare(b.userName);
      } else {
        cmp =
          a.forexMarketDate === b.forexMarketDate
            ? a.generatedAt.localeCompare(b.generatedAt)
            : a.forexMarketDate.localeCompare(b.forexMarketDate);
      }
      return cmp * dir;
    });
  });

  constructor() {
    inject(SeoService).apply({ title: 'Usage Overview' });
    this.load(1);
  }

  private currentFilter(page: number) {
    return {
      page,
      from: this.from || undefined,
      to: this.to || undefined,
      user: this.user.trim() || undefined
    };
  }

  private load(page: number): void {
    this.view.set('loading');
    this.api.usage(this.currentFilter(page)).subscribe({
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
    this.load(1);
  }

  clearFilters(): void {
    this.from = '';
    this.to = '';
    this.user = '';
    this.applyFilters();
  }

  goTo(page: number): void {
    if (page < 1) {
      return;
    }
    this.load(page);
  }

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  sortIndicator(key: SortKey): string {
    if (this.sortKey() !== key) {
      return '';
    }
    return this.sortDir() === 'asc' ? '▲' : '▼';
  }

  planClass(row: UsageRow): string {
    return planBadgeClass(row.planAtGeneration);
  }
}
