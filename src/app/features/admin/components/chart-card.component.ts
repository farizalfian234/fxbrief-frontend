import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import { ChartModule } from 'primeng/chart';

type ChartType = 'bar' | 'line';

/**
 * A titled card wrapping PrimeNG's p-chart (Chart.js). The card chrome and
 * typography are Tailwind/brand; Chart.js is configured with brand navy through
 * its own options object rather than any PrimeNG theme. `responsive` +
 * `maintainAspectRatio: false` inside a fixed-height container is what keeps the
 * chart resizing correctly on mobile.
 */
@Component({
  selector: 'fx-chart-card',
  standalone: true,
  imports: [ChartModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-2xl border border-surface-border bg-white p-5">
      <h2 class="font-display text-sm font-semibold text-navy-900">{{ title }}</h2>
      @if (subtitle) {
        <p class="mt-0.5 text-xs text-navy-400">{{ subtitle }}</p>
      }
      <div class="mt-4 h-56 sm:h-64">
        <p-chart
          [type]="type"
          [data]="data"
          [options]="options"
          [style]="{ height: '100%', width: '100%' }"
        />
      </div>
    </section>
  `
})
export class ChartCardComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input({ required: true }) type: ChartType = 'bar';
  @Input({ required: true }) data: unknown;
  @Input({ required: true }) options: unknown;
}
