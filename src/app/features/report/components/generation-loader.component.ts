import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

const STAGES: { at: number; message: string }[] = [
  { at: 0, message: 'Generating latest market briefing…' },
  { at: 2, message: 'Loading latest market conditions…' },
  { at: 5, message: 'Building multi-timeframe structure…' },
  { at: 8, message: 'Evaluating supply & demand zones…' },
  { at: 12, message: 'Checking M15 confirmation signals…' },
  { at: 16, message: 'Analyzing macroeconomic alignment…' },
  { at: 20, message: 'Ranking setup quality across pairs…' },
  { at: 25, message: 'Selecting highest-quality opportunities…' },
  { at: 30, message: 'Finalizing FXBrief report…' }
];

const TRUST_MESSAGES = [
  'High-quality setups are not forced when market conditions are unclear.',
  'Strong setups require both structure and confirmation.',
  'Fundamental events can strengthen or invalidate technical setups.',
  'FX–Brief analyzes all 8 pairs before selecting the best opportunity.'
];

/**
 * Staged loading overlay shown while a report generates. Messaging is driven by
 * a frontend timer that starts counting the moment generation begins — it is
 * not tied to backend progress. After the final stage (35s+) it cycles
 * reassuring trust messages every six seconds and never claims the report is
 * "almost done", because backend timing is not predictable.
 */
@Component({
  selector: 'fx-generation-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-surface-border bg-white p-8 text-center">
      <i class="pi pi-spinner animate-spin text-3xl text-navy-400"></i>
      <p class="mt-4 text-sm font-medium text-navy-700">{{ message() }}</p>
    </div>
  `
})
export class GenerationLoaderComponent implements OnInit, OnDestroy {
  readonly message = signal(STAGES[0].message);

  private elapsed = 0;
  private tick?: ReturnType<typeof setInterval>;
  private trustIndex = 0;

  ngOnInit(): void {
    this.tick = setInterval(() => {
      this.elapsed += 1;
      this.update();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.tick) {
      clearInterval(this.tick);
    }
  }

  private update(): void {
    if (this.elapsed >= 35) {
      // Cycle trust messages every ~6 seconds.
      if ((this.elapsed - 35) % 6 === 0) {
        this.message.set(TRUST_MESSAGES[this.trustIndex % TRUST_MESSAGES.length]);
        this.trustIndex += 1;
      }
      return;
    }
    let current = STAGES[0].message;
    for (const stage of STAGES) {
      if (this.elapsed >= stage.at) {
        current = stage.message;
      }
    }
    this.message.set(current);
  }
}
