import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  input
} from '@angular/core';

import { PlanName } from '../models/report.models';
import {
  PairCardView,
  biasLabel,
  confidenceLabel,
  formatPairSymbol,
  formatPrice,
  riskReward
} from '../util/report-derivations.util';

/**
 * The pair card, rendered from a normalized PairCardView so it serves every
 * plan: Premium maps each PairAnalysis to a view, Free/Basic map bestPairView.
 * Four sections: pair + bias + confidence, setup status, trade parameters (only
 * when a plan exists), short reasoning. The View Full Analysis control expands
 * the projected accordion when the view carries analysis (Premium); otherwise it
 * renders locked and emits an upgrade request (Free/Basic). The best pair shows
 * a "Best Pair Today" badge and, when expanded, the card is visually elevated.
 */
@Component({
  selector: 'fx-pair-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rounded-2xl border bg-white p-5 shadow-sm transition sm:p-6"
      [class.border-surface-border]="!expanded()"
      [class.border-navy-300]="expanded()"
      [class.bg-navy-50]="expanded()"
      [class.shadow-md]="expanded()"
      [class.ring-1]="isBest()"
      [class.ring-accent]="isBest()"
    >
      <!-- Best pair badge -->
      @if (isBest()) {
        <span
          class="mb-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white"
        >
          <i class="pi pi-star-fill text-[10px]"></i> Best Pair Today
        </span>
      }

      <!-- Section 1: pair + bias + confidence -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-display text-lg font-bold text-navy-900">{{ symbol() }}</h3>
            @if (matchesPreference()) {
              <span
                class="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700"
              >
                <i class="pi pi-check text-[10px]"></i> Matches Your Preference
              </span>
            }
          </div>
          <p class="mt-1 text-sm font-medium" [class]="biasClass()">{{ bias() }}</p>
        </div>

        <!-- Confidence block: prominent, color-coded, level word only -->
        <div
          class="shrink-0 rounded-xl px-3 py-2 text-center"
          [class]="confidenceBlockClass()"
        >
          <span class="block text-[10px] font-medium uppercase tracking-wide opacity-70">Confidence</span>
          <span class="block text-base font-bold uppercase tracking-wide">{{ confidence() }}</span>
        </div>
      </div>

      <!-- Section 2: setup status -->
      <div class="mt-4 rounded-lg bg-surface-muted px-3 py-2.5">
        <p class="text-xs font-semibold uppercase tracking-wide text-navy-400">Setup status</p>
        <p class="mt-0.5 text-sm text-navy-700">{{ view().setupStatus }}</p>
      </div>

      <!-- Section 3: trade parameters -->
      @if (view().tradePlan; as plan) {
        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p class="text-xs font-medium text-navy-400">Entry zone</p>
            <p class="mt-0.5 text-sm font-semibold text-navy-900">{{ fmt(plan.entryLow) }} – {{ fmt(plan.entryHigh) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-navy-400">Stop loss</p>
            <p class="mt-0.5 text-sm font-semibold text-navy-900">{{ fmt(plan.stopLoss) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-navy-400">Take profit</p>
            <p class="mt-0.5 text-sm font-semibold text-navy-900">{{ fmt(plan.takeProfit) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-navy-400">R:R</p>
            <p class="mt-0.5 text-sm font-semibold text-navy-900">{{ rr() ?? '—' }}</p>
          </div>
        </div>
      } @else {
        <p class="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
          Awaiting confirmation — no trade plan yet.
        </p>
      }

      <!-- Section 4: short reasoning -->
      <p class="mt-4 text-sm leading-relaxed text-navy-600">{{ view().shortReasoning }}</p>

      <!-- View Full Analysis -->
      @if (canExpand() || !hideLockedUpsell()) {
        <div class="mt-5 border-t border-surface-border pt-4">
          @if (canExpand()) {
            <button
              type="button"
              (click)="toggle.emit()"
              class="flex w-full items-center justify-between text-sm font-semibold text-accent"
            >
              <span>{{ expanded() ? 'Hide full analysis' : 'View full analysis' }}</span>
              <i class="pi" [class.pi-chevron-down]="!expanded()" [class.pi-chevron-up]="expanded()"></i>
            </button>
            @if (expanded()) {
              <div class="mt-4">
                <ng-content />
              </div>
            }
          } @else {
            <button
              type="button"
              (click)="upgrade.emit()"
              class="flex w-full items-center justify-between rounded-lg border border-dashed border-navy-200 bg-surface-muted px-3 py-2.5 text-sm font-semibold text-navy-400 transition hover:border-navy-300 hover:text-navy-500"
            >
              <span class="flex items-center gap-2">
                <i class="pi pi-lock text-xs"></i> View full analysis
              </span>
              <span class="rounded-full bg-navy-600 px-2 py-0.5 text-xs font-semibold text-white">Upgrade</span>
            </button>
          }
        </div>
      }
    </div>
  `
})
export class PairCardComponent {
  readonly view = input.required<PairCardView>();
  readonly plan = input.required<PlanName>();
  readonly isBest = input(false);
  readonly matchesPreference = input(false);
  readonly expanded = input(false);
  /** When true, Free/Basic cards omit the locked upsell entirely (used in history detail). */
  readonly hideLockedUpsell = input(false);

  @Output() toggle = new EventEmitter<void>();
  @Output() upgrade = new EventEmitter<void>();

  readonly canExpand = computed(() => this.plan() === 'PREMIUM' && this.view().analysis !== null);
  readonly symbol = computed(() => formatPairSymbol(this.view().pair));
  readonly bias = computed(() => biasLabel(this.view().bias));
  readonly confidence = computed(() => confidenceLabel(this.view().confidenceLevel));

  fmt(value: number): string {
    return formatPrice(value);
  }
  readonly rr = computed(() => {
    const p = this.view().tradePlan;
    return p ? riskReward(p)?.label ?? null : null;
  });

  readonly biasClass = computed(() => {
    switch (this.view().bias) {
      case 'BULLISH':
        return 'text-green-600';
      case 'BEARISH':
        return 'text-red-600';
      default:
        return 'text-navy-500';
    }
  });

  readonly confidenceBlockClass = computed(() => {
    switch (this.view().confidenceLevel) {
      case 'HIGH':
        return 'bg-green-100 text-green-700';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-navy-100 text-navy-600';
    }
  });
}
