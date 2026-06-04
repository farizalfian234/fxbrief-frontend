import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PairAnalysis, ReportResponse } from '../models/report.models';
import {
  bestPairOf,
  biasLabel,
  confidenceLabel,
  highImpactEventsToday,
  highestFundamentalAlignment,
  marketEnvironment,
  opportunityWindow,
  pairsToAvoid,
  validSetups,
  weakestPair
} from '../util/report-derivations.util';

interface SummaryItem {
  label: string;
  value: string;
}

/**
 * The summary section at the top of a report. Free/Basic show five fields
 * derived from the narrowed best-pair view; Premium shows eight fields derived
 * across all pairs. Everything is computed from the payload — no extra call.
 */
@Component({
  selector: 'fx-report-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-navy-200 bg-navy-50 px-6 py-7 shadow-sm sm:px-8 sm:py-9">
      <p class="text-xs font-semibold uppercase tracking-widest text-accent">Today's market conclusion</p>
      <h2 class="mt-1 font-display text-xl font-bold text-navy-900 sm:text-2xl">Market summary</h2>
      <dl class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        @for (item of items(); track item.label) {
          <div class="rounded-lg bg-white px-4 py-3 shadow-sm">
            <dt class="text-xs font-medium text-navy-400">{{ item.label }}</dt>
            <dd class="mt-1 text-sm font-semibold text-navy-900">{{ item.value }}</dd>
          </div>
        }
      </dl>

      @if (premiumEvents().length) {
        <div class="mt-4 rounded-lg bg-amber-50 px-3 py-2.5">
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">
            High-impact events today
          </p>
          <p class="mt-1 text-sm text-amber-800">{{ premiumEventsLabel() }}</p>
        </div>
      }
    </div>
  `
})
export class ReportSummaryComponent {
  readonly report = input.required<ReportResponse>();

  private readonly isPremium = computed(() => this.report().planAtGeneration === 'PREMIUM');

  readonly items = computed<SummaryItem[]>(() => {
    const report = this.report();
    return this.isPremium() ? this.premiumItems(report) : this.basicItems(report);
  });

  readonly premiumEvents = computed(() => {
    if (!this.isPremium()) {
      return [];
    }
    const pairs = this.report().payload.pairs ?? [];
    return highImpactEventsToday(pairs, new Date());
  });

  readonly premiumEventsLabel = computed(() =>
    this.premiumEvents()
      .map((e) => e.event)
      .join(', ')
  );

  private basicItems(report: ReportResponse): SummaryItem[] {
    const view = report.payload.bestPairView;
    if (!view) {
      return [];
    }
    return [
      { label: 'Best Pair', value: view.pair },
      { label: 'Market Bias', value: biasLabel(view.dailyBias) },
      { label: 'Setup Quality', value: confidenceLabel(view.confidenceLevel) },
      { label: 'Major News Risk', value: view.majorNewsRisk ? 'Yes' : 'No' },
      { label: 'Active Opportunity Window', value: opportunityWindow(view.signalState) }
    ];
  }

  private premiumItems(report: ReportResponse): SummaryItem[] {
    const pairs = report.payload.pairs ?? [];
    const best = bestPairOf(report);
    const weakest = weakestPair(pairs);
    const align = highestFundamentalAlignment(pairs);
    const avoid = pairsToAvoid(pairs);
    const setups = validSetups(pairs);
    const env = marketEnvironment(
      report.payload.marketsConsolidating,
      best?.structureByTimeframe.W?.bias
    );

    return [
      { label: 'Strongest Pair', value: best?.pair ?? '—' },
      { label: 'Weakest Pair', value: weakest?.pair ?? '—' },
      { label: 'Best Technical Structure', value: this.technicalStructure(best) },
      { label: 'Highest Fundamental Alignment', value: align?.pair ?? '—' },
      { label: 'Valid Setups', value: setups.label },
      { label: 'Pairs To Avoid', value: avoid.length ? avoid.join(', ') : 'None' },
      { label: 'Market Environment', value: env }
    ];
  }

  private technicalStructure(best: PairAnalysis | null): string {
    if (!best) {
      return '—';
    }
    const d = best.structureByTimeframe.D?.bias;
    return d ? `${best.pair} · ${biasLabel(d)}` : best.pair;
  }
}
