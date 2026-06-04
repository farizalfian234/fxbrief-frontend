import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { forkJoin } from 'rxjs';

import { SeoService } from '../../../../core/services/seo.service';
import { errorCodeOf, messageForError } from '../../../../shared/util/api-error.util';
import { ReportApiService } from '../../../report/services/report-api.service';
import { SubscriptionApiService } from '../../../subscription/services/subscription-api.service';
import { PreferencesApiService } from '../../../preferences/services/preferences-api.service';
import { ReportResponse, GenerateRequest } from '../../../report/models/report.models';
import { Subscription } from '../../../subscription/models/subscription.models';
import {
  PreferenceOptions,
  PreferenceType,
  UserPreference
} from '../../../preferences/models/preferences.models';
import {
  formatCountdown,
  formatUtcClock,
  isMarketClosed,
  msUntilOpen
} from '../../../report/util/forex-clock.util';
import {
  bestPairOf,
  bestPairViewToView,
  minutesSince,
  pairAnalysisToView,
  pairsByConfidence
} from '../../../report/util/report-derivations.util';

import { ReportSummaryComponent } from '../../../report/components/report-summary.component';
import { PairCardComponent } from '../../../report/components/pair-card.component';
import { FullAnalysisComponent } from '../../../report/components/full-analysis.component';
import { CompactPreviewsComponent } from '../../../report/components/compact-previews.component';
import { GenerationLoaderComponent } from '../../../report/components/generation-loader.component';
import { TopUpModalComponent } from '../../../subscription/components/top-up-modal.component';
import {
  PreferencePickerComponent,
  PreferenceSelection
} from '../../../preferences/components/preference-picker.component';

type View = 'loading' | 'empty' | 'generating' | 'report';

@Component({
  selector: 'fx-dashboard',
  standalone: true,
  imports: [
    ReportSummaryComponent,
    PairCardComponent,
    FullAnalysisComponent,
    CompactPreviewsComponent,
    GenerationLoaderComponent,
    TopUpModalComponent,
    PreferencePickerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header: plan badge + remaining -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-navy-900">Dashboard</h1>
        @if (subscription(); as sub) {
          <p class="mt-1 text-sm text-navy-500">
            <span class="font-medium text-navy-700">{{ sub.remainingReports }}</span> reports remaining
          </p>
        }
      </div>
      @if (subscription(); as sub) {
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          [class]="planBadgeClass()"
        >
          {{ sub.effectivePlan.name }}
        </span>
      }
    </div>

    @if (banner(); as msg) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ msg }}</p>
    }

    @switch (view()) {
      @case ('loading') {
        <div class="mt-6 space-y-3">
          <div class="h-28 animate-pulse rounded-2xl bg-white"></div>
          <div class="h-48 animate-pulse rounded-2xl bg-white"></div>
        </div>
      }

      @case ('generating') {
        <div class="mt-6">
          <fx-generation-loader />
        </div>
      }

      @case ('empty') {
        <div class="mt-6">
          <!-- Preference override (collapsed by default) -->
          @if (preferenceOptions() && canGenerate()) {
            <div class="rounded-2xl border border-surface-border bg-white p-5">
              <button
                type="button"
                (click)="overrideOpen.set(!overrideOpen())"
                class="flex w-full items-center justify-between text-sm font-medium text-navy-700"
              >
                <span>Customize this report (optional)</span>
                <i class="pi" [class.pi-chevron-down]="!overrideOpen()" [class.pi-chevron-up]="overrideOpen()"></i>
              </button>
              @if (overrideOpen()) {
                <div class="mt-4">
                  <fx-preference-picker
                    [options]="preferenceOptions()!"
                    [initialType]="savedType()"
                    [initialValue]="savedValue()"
                    (selectionChange)="onOverrideChange($event)"
                  />
                  <p class="mt-2 text-xs text-navy-400">
                    Set your default preferences on your Account page.
                  </p>
                </div>
              }
            </div>
          }

          <!-- Generate area with disabled states -->
          <div class="mt-4 rounded-2xl border border-surface-border bg-white p-8 text-center">
            @if (marketClosed()) {
              <p class="text-sm font-medium text-navy-700">
                Market closed · Current time: {{ utcClock() }} · Opens in {{ countdown() }}
              </p>
              <button
                type="button"
                disabled
                class="mt-4 inline-flex items-center justify-center rounded-lg bg-navy-200 px-6 py-3 text-sm font-semibold text-white"
              >
                Generate Report
              </button>
            } @else if (noRemaining()) {
              <p class="text-sm font-medium text-navy-700">You've used all your reports.</p>
              <button
                type="button"
                (click)="openTopUp()"
                class="mt-4 inline-flex items-center justify-center rounded-lg bg-navy-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                Top Up — Basic $10 / Premium $20
              </button>
            } @else if (consolidating()) {
              <p class="text-sm font-medium text-navy-700">
                Markets are consolidating today. No clear setups available. Your report limit was not
                subtracted.
              </p>
            } @else {
              <p class="text-sm text-navy-500">
                Your daily market briefing is ready to generate.
              </p>
              <button
                type="button"
                (click)="generate()"
                class="mt-4 inline-flex items-center justify-center rounded-lg bg-navy-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                Generate Report
              </button>
            }
          </div>
        </div>
      }

      @case ('report') {
        @if (report(); as rep) {
          <!-- Post-generation popup -->
          @if (postGenMessage(); as pg) {
            <div class="mt-4 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-700">{{ pg }}</div>
          }

          <div class="mt-6 flex flex-col gap-4">
            <fx-report-summary [report]="rep" />

            <!-- Best pair card (Premium PairAnalysis or Free/Basic bestPairView) -->
            @if (bestPairView(); as best) {
              <fx-pair-card
                [view]="best"
                [plan]="rep.planAtGeneration"
                [isBest]="true"
                [matchesPreference]="prefMatch(best.pair)"
                [expanded]="isExpanded(best.pair)"
                (toggle)="toggleExpand(best.pair)"
                (upgrade)="openTopUp()"
              >
                @if (best.analysis; as a) {
                  <fx-full-analysis [pair]="a" />
                }
              </fx-pair-card>
            }

            <!-- Premium: remaining 7 full cards. Free/Basic: 3 compact previews -->
            @if (rep.planAtGeneration === 'PREMIUM') {
              @for (p of remainingPremiumViews(); track p.pair) {
                <fx-pair-card
                  [view]="p"
                  [plan]="rep.planAtGeneration"
                  [matchesPreference]="prefMatch(p.pair)"
                  [expanded]="isExpanded(p.pair)"
                  (toggle)="toggleExpand(p.pair)"
                  (upgrade)="openTopUp()"
                >
                  @if (p.analysis; as a) {
                    <fx-full-analysis [pair]="a" />
                  }
                </fx-pair-card>
              }
            } @else if (compactPreviews().length) {
              <fx-compact-previews [previews]="compactPreviews()" (upgrade)="openTopUp()" />
            }
          </div>
        }
      }
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
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly reportApi = inject(ReportApiService);
  private readonly subscriptionApi = inject(SubscriptionApiService);
  private readonly preferencesApi = inject(PreferencesApiService);

  readonly view = signal<View>('loading');
  readonly subscription = signal<Subscription | null>(null);
  readonly report = signal<ReportResponse | null>(null);
  readonly preferenceOptions = signal<PreferenceOptions | null>(null);
  readonly savedType = signal<PreferenceType | null>(null);
  readonly savedValue = signal<string | null>(null);
  readonly banner = signal('');

  readonly overrideOpen = signal(false);
  readonly topUpOpen = signal(false);
  readonly expandedPairs = signal<ReadonlySet<string>>(new Set());
  readonly postGenMessage = signal('');

  private override: GenerateRequest = {};
  private now = new Date();
  private clockTimer?: ReturnType<typeof setInterval>;
  readonly tick = signal(0);

  // Disabled-state derivations.
  readonly marketClosed = computed(() => {
    this.tick();
    const sub = this.subscription();
    // Prefer backend truth; fall back to local clock for the live display.
    return sub ? !sub.marketOpen : isMarketClosed(this.now);
  });
  readonly noRemaining = computed(() => (this.subscription()?.remainingReports ?? 0) <= 0);
  readonly consolidating = signal(false);
  readonly canGenerate = computed(
    () => !this.marketClosed() && !this.noRemaining() && !this.consolidating()
  );

  readonly utcClock = computed(() => {
    this.tick();
    return formatUtcClock(this.now);
  });
  readonly countdown = computed(() => {
    this.tick();
    return formatCountdown(msUntilOpen(this.now));
  });

  readonly planBadgeClass = computed(() => {
    switch (this.subscription()?.effectivePlan.name) {
      case 'PREMIUM':
        return 'bg-navy-600 text-white';
      case 'BASIC':
        return 'bg-accent text-white';
      default:
        return 'bg-navy-100 text-navy-700';
    }
  });

  readonly bestPairView = computed(() => {
    const rep = this.report();
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

  readonly remainingPremiumViews = computed(() => {
    const rep = this.report();
    if (rep?.planAtGeneration !== 'PREMIUM' || !rep.payload.pairs) {
      return [];
    }
    const best = bestPairOf(rep);
    return pairsByConfidence(rep.payload.pairs)
      .filter((p) => p.pair !== best?.pair)
      .map(pairAnalysisToView);
  });

  readonly compactPreviews = computed(() => this.report()?.payload.compactPreviews ?? []);

  constructor() {
    inject(SeoService).apply({ title: 'Dashboard' });
  }

  ngOnInit(): void {
    this.load();
    this.clockTimer = setInterval(() => {
      this.now = new Date();
      this.tick.update((t) => t + 1);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }
  }

  private load(): void {
    this.view.set('loading');
    forkJoin({
      subscription: this.subscriptionApi.get(),
      today: this.reportApi.today(),
      preference: this.preferencesApi.get(),
      options: this.preferencesApi.options()
    }).subscribe({
      next: ({ subscription, today, preference, options }) => {
        this.subscription.set(subscription);
        this.preferenceOptions.set(options);
        this.seedPreference(preference);
        if (today) {
          this.report.set(today);
          this.view.set('report');
        } else {
          this.view.set('empty');
        }
      },
      error: (err) => {
        this.banner.set(messageForError(err));
        this.view.set('empty');
      }
    });
  }

  private seedPreference(pref: UserPreference): void {
    if (pref.set && pref.preferenceType && pref.preferenceValue) {
      this.savedType.set(pref.preferenceType);
      this.savedValue.set(pref.preferenceValue);
      this.override = {
        preferenceType: pref.preferenceType,
        preferenceValue: pref.preferenceValue
      };
    }
  }

  onOverrideChange(selection: PreferenceSelection): void {
    this.override =
      selection.preferenceType && selection.preferenceValue
        ? {
            preferenceType: selection.preferenceType,
            preferenceValue: selection.preferenceValue
          }
        : {};
  }

  generate(): void {
    this.banner.set('');
    this.view.set('generating');
    const startedAt = Date.now();

    this.reportApi.generate(this.override).subscribe({
      next: (rep) => {
        const elapsedMs = Date.now() - startedAt;
        this.consolidating.set(rep.payload.marketsConsolidating);
        if (rep.payload.marketsConsolidating) {
          // No setups; limit not subtracted. Refresh subscription and show message.
          this.refreshSubscription();
          this.view.set('empty');
          this.resetOverride();
          return;
        }
        this.report.set(rep);
        this.subscription.update((s) =>
          s ? { ...s, remainingReports: rep.remainingReports } : s
        );
        this.setPostGenMessage(rep, elapsedMs);
        this.view.set('report');
        this.resetOverride();
      },
      error: (err) => this.handleGenerateError(err)
    });
  }

  private setPostGenMessage(rep: ReportResponse, elapsedMs: number): void {
    if (elapsedMs < 3000) {
      const mins = minutesSince(rep.payload.marketDataFetchedAt, new Date());
      this.postGenMessage.set(`Latest market briefing loaded · Updated ${mins} minutes ago`);
    } else {
      this.postGenMessage.set('Fresh market briefing generated · Based on latest market conditions');
    }
  }

  private handleGenerateError(err: unknown): void {
    const code = errorCodeOf(err);
    switch (code) {
      case 'MARKET_CLOSED':
        this.view.set('empty');
        break;
      case 'NO_REMAINING_REPORTS':
        this.refreshSubscription();
        this.view.set('empty');
        break;
      case 'DAILY_LIMIT_REACHED':
        this.banner.set('You have already generated a report today. Come back after 22:00 UTC.');
        this.view.set('empty');
        break;
      default:
        this.banner.set(messageForError(err));
        this.view.set('empty');
    }
  }

  private resetOverride(): void {
    // After generation, override resets to the account default.
    this.override =
      this.savedType() && this.savedValue()
        ? { preferenceType: this.savedType()!, preferenceValue: this.savedValue()! }
        : {};
    this.overrideOpen.set(false);
  }

  prefMatch(pair: string): boolean {
    return this.report()?.preferenceMatches?.[pair] === true;
  }

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

  openTopUp(): void {
    this.topUpOpen.set(true);
  }

  onPaid(): void {
    this.topUpOpen.set(false);
    // Re-fetch subscription and today's report: the upgraded plan_at_generation
    // returns a richer payload for an already-generated report.
    this.refreshSubscription();
    this.reportApi.today().subscribe({
      next: (today) => {
        if (today) {
          this.report.set(today);
          this.view.set('report');
        }
      }
    });
  }

  private refreshSubscription(): void {
    this.subscriptionApi.get().subscribe({
      next: (sub) => this.subscription.set(sub)
    });
  }
}
