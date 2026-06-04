import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PairAnalysis } from '../models/report.models';
import { biasLabel, formatEventDateTime, formatPrice, latestEvents } from '../util/report-derivations.util';

/**
 * The expanded Premium analysis for a single pair: executive reasoning, full
 * multi-timeframe structure, the active supply/demand zone, M15 confirmation
 * signals, confidence factors, setup lifecycle/risk, and fundamental context.
 * Renders only the sections present in the payload, so partial data degrades
 * gracefully rather than showing empty headings.
 */
@Component({
  selector: 'fx-full-analysis',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      @if (pair().executiveReasoning) {
        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Executive reasoning
          </h4>
          <p class="mt-2 text-sm leading-relaxed text-navy-700">{{ pair().executiveReasoning }}</p>
        </section>
      }

      <section>
        <h4 class="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Market structure
        </h4>
        <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          @for (tf of timeframes(); track tf.key) {
            <div class="rounded-lg bg-surface-muted px-3 py-2">
              <p class="text-xs font-medium text-navy-400">{{ tf.key }}</p>
              <p class="mt-0.5 text-sm font-semibold text-navy-900">{{ tf.bias }}</p>
              @if (tf.event) {
                <p class="mt-0.5 text-[11px] text-navy-500">{{ tf.event }}</p>
              }
            </div>
          }
        </div>
      </section>

      @if (pair().activeZone; as zone) {
        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Active {{ zone.type === 'SUPPLY' ? 'supply' : 'demand' }} zone
          </h4>
          <p class="mt-1 text-sm text-navy-700">
            {{ fmt(zone.low) }} – {{ fmt(zone.high) }}
            @if (zone.state) {
              <span class="text-navy-400">· {{ zone.state }}</span>
            }
          </p>
        </section>
      }

      @if (pair().m15Confirmation; as m15) {
        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wide text-navy-400">
            M15 confirmation
          </h4>
          <div class="mt-2 flex flex-wrap gap-2">
            @for (sig of m15Signals(); track sig.label) {
              <span
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                [class]="sig.on ? 'bg-green-50 text-green-700' : 'bg-navy-50 text-navy-400'"
              >
                <i class="pi text-[10px]" [class.pi-check]="sig.on" [class.pi-minus]="!sig.on"></i>
                {{ sig.label }}
              </span>
            }
          </div>
        </section>
      }

      <section>
        <h4 class="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Confidence assessment
        </h4>
        <p class="mt-1 text-sm text-navy-700">
          {{ confidenceLevelLabel() }}
        </p>
        @if (pair().confidence.factors?.length) {
          <ul class="mt-2 space-y-1">
            @for (f of pair().confidence.factors; track f.label) {
              <li class="flex items-center justify-between text-sm">
                <span class="text-navy-600" [class.line-through]="!f.applied" [class.text-navy-400]="!f.applied">
                  {{ f.label }}
                </span>
                <span class="font-medium" [class]="f.delta >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ f.delta >= 0 ? '+' : '' }}{{ f.delta }}
                </span>
              </li>
            }
          </ul>
        }
      </section>

      @if (pair().invalidationNote) {
        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Setup lifecycle &amp; risk
          </h4>
          <p class="mt-1 text-sm leading-relaxed text-navy-700">{{ pair().invalidationNote }}</p>
        </section>
      }

      <section>
        <h4 class="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Fundamental context
        </h4>
        <p class="mt-1 text-sm text-navy-700">
          {{ pair().fundamental.currency }} bias:
          <span class="font-semibold">{{ fundamentalBias() }}</span>
          @if (pair().fundamental.highImpactThisWeek) {
            <span class="ml-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700"
              >High-impact news this week</span
            >
          }
        </p>
        @if (pair().fundamentalSummary) {
          <p class="mt-1 text-sm leading-relaxed text-navy-600">{{ pair().fundamentalSummary }}</p>
        }
        @if (events().length) {
          <ul class="mt-2 space-y-1.5">
            @for (ev of events(); track ev.event + ev.date) {
              <li class="flex items-center gap-2 text-sm text-navy-600">
                <span
                  class="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium"
                  [class]="eventClass(ev.importance)"
                  >{{ ev.importance }}</span
                >
                <span class="flex-1 truncate">{{ ev.event }}</span>
                <span class="shrink-0 text-xs text-navy-400">{{ eventDate(ev.date) }}</span>
              </li>
            }
          </ul>
        }
      </section>
    </div>
  `
})
export class FullAnalysisComponent {
  readonly pair = input.required<PairAnalysis>();

  readonly timeframes = computed(() => {
    const s = this.pair().structureByTimeframe;
    const rows: { key: string; bias: string; event: string }[] = [];
    for (const key of ['W', 'D', 'H4', 'M15'] as const) {
      const tf = s[key];
      if (tf) {
        rows.push({
          key,
          bias: biasLabel(tf.bias),
          event:
            tf.lastStructuralEvent && tf.lastStructuralEvent !== 'NONE'
              ? tf.lastStructuralEvent
              : ''
        });
      }
    }
    return rows;
  });

  readonly m15Signals = computed(() => {
    const m = this.pair().m15Confirmation;
    if (!m) {
      return [];
    }
    return [
      { label: 'Break of structure', on: !!m.bos },
      { label: 'Liquidity sweep', on: !!m.liquiditySweep },
      { label: 'Engulfing displacement', on: !!m.engulfingDisplacement },
      { label: 'CHOCH aligned', on: !!m.chochAligned }
    ];
  });

  readonly confidenceLevelLabel = computed(() => {
    const level = this.pair().confidence.level;
    return level.charAt(0) + level.slice(1).toLowerCase();
  });

  readonly fundamentalBias = computed(() => biasLabel(this.pair().fundamental.bias));

  /** Latest 3 relevant events (payload is already Medium/High only), future -> past. */
  readonly events = computed(() => latestEvents(this.pair().fundamental.events, 3));

  eventDate(iso: string): string {
    return formatEventDateTime(iso);
  }

  fmt(value: number): string {
    return formatPrice(value);
  }

  eventClass(importance: string): string {
    if (importance === 'High') return 'bg-red-50 text-red-700';
    if (importance === 'Medium') return 'bg-amber-50 text-amber-700';
    return 'bg-navy-50 text-navy-500';
  }
}
