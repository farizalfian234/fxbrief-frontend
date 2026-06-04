import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { SeoService } from '../../../../core/services/seo.service';
import { messageForError } from '../../../../shared/util/api-error.util';
import { ReportApiService } from '../../../report/services/report-api.service';
import { SubscriptionApiService } from '../../../subscription/services/subscription-api.service';
import { HistoryItem, HistoryPage, ReportResponse } from '../../../report/models/report.models';
import { Subscription } from '../../../subscription/models/subscription.models';
import { humanizePreferenceValue } from '../../../preferences/components/preference-picker.component';
import {
  bestPairOf,
  bestPairViewToView,
  pairAnalysisToView,
  pairsByConfidence
} from '../../../report/util/report-derivations.util';

import { ReportSummaryComponent } from '../../../report/components/report-summary.component';
import { PairCardComponent } from '../../../report/components/pair-card.component';
import { FullAnalysisComponent } from '../../../report/components/full-analysis.component';
import { TopUpModalComponent } from '../../../subscription/components/top-up-modal.component';

type View = 'loading' | 'ready';

@Component({
  selector: 'fx-history',
  standalone: true,
  imports: [
    ReportSummaryComponent,
    PairCardComponent,
    FullAnalysisComponent,
    TopUpModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="font-display text-2xl font-bold text-navy-900">Report History</h1>

    @if (banner(); as msg) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ msg }}</p>
    }

    @if (view() === 'loading') {
      <div class="mt-6 h-64 animate-pulse rounded-2xl bg-white"></div>
    }

    @if (view() === 'ready' && page(); as pg) {
      @if (pg.locked) {
        <!-- Locked: blurred table + upgrade prompt -->
        <div class="relative mt-6">
          <div class="pointer-events-none select-none blur-sm">
            <div class="overflow-hidden rounded-2xl border border-surface-border bg-white">
              <div class="grid grid-cols-3 gap-2 border-b border-surface-border bg-surface-muted px-4 py-3 text-xs font-semibold text-navy-500">
                <span>Date</span><span>Plan</span><span>Summary</span>
              </div>
              @for (row of placeholderRows; track row) {
                <div class="grid grid-cols-3 gap-2 border-b border-surface-border px-4 py-3 text-sm text-navy-400">
                  <span>—</span><span>—</span><span>Locked preview row</span>
                </div>
              }
            </div>
          </div>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p class="text-sm font-semibold text-navy-900">Report history is locked</p>
            <p class="mt-1 text-sm text-navy-500">Top up to Basic or Premium to unlock your history.</p>
            <button
              type="button"
              (click)="topUpOpen.set(true)"
              class="mt-4 inline-flex items-center justify-center rounded-lg bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >
              Unlock Premium
            </button>
          </div>
        </div>
      } @else if (!pg.items.length) {
        <div class="mt-6 rounded-2xl border border-surface-border bg-white p-8 text-center">
          <p class="text-sm font-semibold text-navy-900">No reports yet</p>
          <p class="mt-1 text-sm text-navy-500">
            Generate your first report from the Dashboard and it will appear here.
          </p>
        </div>
      } @else {
        <!-- Table -->
        <div class="mt-6 overflow-x-auto rounded-2xl border border-surface-border bg-white">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead class="border-b border-surface-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-navy-500">
              <tr>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Plan</th>
                <th class="px-4 py-3">Preference</th>
                <th class="px-4 py-3">Summary</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (item of pg.items; track item.reportId) {
                <tr class="border-b border-surface-border last:border-0">
                  <td class="whitespace-nowrap px-4 py-3 text-navy-700">{{ item.forexMarketDate }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold" [class]="planClass(item)">
                      {{ item.planAtGeneration }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-navy-600">{{ preferenceLabel(item) }}</td>
                  <td class="px-4 py-3 text-navy-600">{{ item.summary }}</td>
                  <td class="px-4 py-3 text-right">
                    <button
                      type="button"
                      (click)="openReport(item.reportId)"
                      class="text-sm font-semibold text-accent hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (showBasicLockMessage()) {
          <div class="mt-4 rounded-2xl border border-surface-border bg-white p-5 text-center">
            <p class="text-sm text-navy-600">
              You have more than 10 archived reports. Upgrade to Premium to access your full history.
            </p>
            <button
              type="button"
              (click)="topUpOpen.set(true)"
              class="mt-3 inline-flex items-center justify-center rounded-lg bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >
              Unlock Premium
            </button>
          </div>
        }

        <!-- Premium pagination -->
        @if (pg.totalPages > 1) {
          <div class="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              (click)="goTo(pg.page - 1)"
              [disabled]="pg.page <= 1"
              class="rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span class="text-sm text-navy-500">Page {{ pg.page }} of {{ pg.totalPages }}</span>
            <button
              type="button"
              (click)="goTo(pg.page + 1)"
              [disabled]="pg.page >= pg.totalPages"
              class="rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        }
      }
    }

    <!-- Inline report viewer -->
    @if (selected(); as rep) {
      <div
        class="fixed inset-0 z-50 overflow-y-auto bg-navy-900/60 px-4 py-8 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <div class="mx-auto max-w-2xl rounded-2xl bg-surface-muted p-5 shadow-2xl sm:p-6">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-lg font-bold text-navy-900">
              Report · {{ rep.forexMarketDate }}
            </h2>
            <button
              type="button"
              (click)="selected.set(null)"
              class="rounded-lg p-1.5 text-navy-400 transition hover:bg-white"
              aria-label="Close"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="mt-4 flex flex-col gap-4">
            <fx-report-summary [report]="rep" />
            @if (selectedBestView(); as best) {
              <fx-pair-card
                [view]="best"
                [plan]="rep.planAtGeneration"
                [isBest]="true"
                [hideLockedUpsell]="true"
                [expanded]="isExpanded(best.pair)"
                (toggle)="toggleExpand(best.pair)"
                (upgrade)="topUpOpen.set(true)"
              >
                @if (best.analysis; as a) {
                  <fx-full-analysis [pair]="a" />
                }
              </fx-pair-card>
            }
            @if (rep.planAtGeneration === 'PREMIUM') {
              @for (p of selectedRemainingViews(); track p.pair) {
                <fx-pair-card
                  [view]="p"
                  [plan]="rep.planAtGeneration"
                  [expanded]="isExpanded(p.pair)"
                  (toggle)="toggleExpand(p.pair)"
                  (upgrade)="topUpOpen.set(true)"
                >
                  @if (p.analysis; as a) {
                    <fx-full-analysis [pair]="a" />
                  }
                </fx-pair-card>
              }
            }
          </div>
        </div>
      </div>
    }

    @if (topUpOpen()) {
      <fx-top-up-modal
        [remainingReports]="subscription()?.remainingReports ?? 0"
        (paid)="onPaid()"
        (close)="topUpOpen.set(false)"
      />
    }
  `
})
export class HistoryComponent {
  private readonly reportApi = inject(ReportApiService);
  private readonly subscriptionApi = inject(SubscriptionApiService);

  readonly view = signal<View>('loading');
  readonly page = signal<HistoryPage | null>(null);
  readonly subscription = signal<Subscription | null>(null);
  readonly selected = signal<ReportResponse | null>(null);
  readonly expandedPairs = signal<ReadonlySet<string>>(new Set());
  readonly topUpOpen = signal(false);
  readonly banner = signal('');

  readonly placeholderRows = [1, 2, 3, 4, 5];

  readonly showBasicLockMessage = computed(() => {
    const pg = this.page();
    const sub = this.subscription();
    return (
      !!pg &&
      !pg.locked &&
      sub?.effectivePlan.name === 'BASIC' &&
      pg.totalArchivedCount > 10
    );
  });

  readonly selectedBestView = computed(() => {
    const rep = this.selected();
    if (!rep) {
      return null;
    }
    if (rep.planAtGeneration === 'PREMIUM') {
      const best = bestPairOf(rep);
      return best ? pairAnalysisToView(best) : null;
    }
    const view = rep.payload.bestPairView;
    return view ? bestPairViewToView(view) : null;
  });

  readonly selectedRemainingViews = computed(() => {
    const rep = this.selected();
    if (rep?.planAtGeneration !== 'PREMIUM' || !rep.payload.pairs) {
      return [];
    }
    const best = bestPairOf(rep);
    return pairsByConfidence(rep.payload.pairs)
      .filter((p) => p.pair !== best?.pair)
      .map(pairAnalysisToView);
  });

  isExpanded(pair: string): boolean {
    return this.expandedPairs().has(pair);
  }

  toggleExpand(pair: string): void {
    this.expandedPairs.update((cur) => {
      const next = new Set(cur);
      if (next.has(pair)) {
        next.delete(pair);
      } else {
        next.add(pair);
      }
      return next;
    });
  }

  constructor() {
    inject(SeoService).apply({ title: 'Report History' });
    this.subscriptionApi.get().subscribe({ next: (s) => this.subscription.set(s) });
    this.load(1);
  }

  private load(page: number): void {
    this.view.set('loading');
    this.reportApi.history(page).subscribe({
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

  goTo(page: number): void {
    if (page < 1) {
      return;
    }
    this.load(page);
  }

  openReport(reportId: number): void {
    this.reportApi.historyDetail(reportId).subscribe({
      next: (rep) => {
        this.expandedPairs.set(new Set());
        this.selected.set(rep);
      },
      error: (err) => this.banner.set(messageForError(err))
    });
  }

  onPaid(): void {
    this.topUpOpen.set(false);
    this.subscriptionApi.get().subscribe({ next: (s) => this.subscription.set(s) });
    this.load(1);
  }

  planClass(item: HistoryItem): string {
    switch (item.planAtGeneration) {
      case 'PREMIUM':
        return 'bg-navy-600 text-white';
      case 'BASIC':
        return 'bg-accent text-white';
      default:
        return 'bg-navy-100 text-navy-700';
    }
  }

  preferenceLabel(item: HistoryItem): string {
    const value = item.preferenceSnapshot?.preferenceValue;
    if (!value) {
      return '—';
    }
    // A value containing "/" is a currency pair (e.g. xau/usd) — show it in caps.
    return value.includes('/') ? value.toUpperCase() : humanizePreferenceValue(value);
  }
}
