import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { CompactPreview } from '../models/report.models';
import { sentimentLabel } from '../util/report-derivations.util';

/**
 * Free/Basic view of the remaining pairs: exactly the three compact previews
 * the backend selected (highest, middle, lowest confidence) shown as pair name
 * plus a direction + signal sentiment label, followed by the additional-coverage
 * upsell. Premium users never see this — they get the full pair cards instead.
 */
@Component({
  selector: 'fx-compact-previews',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
      <div class="space-y-2.5">
        @for (preview of previews(); track preview.pair) {
          <div class="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2.5">
            <span class="text-sm font-semibold text-navy-900">{{ preview.pair }}</span>
            <span class="text-sm text-navy-500">{{ label(preview) }}</span>
          </div>
        }
      </div>

      <div class="mt-5 border-t border-surface-border pt-4 text-center">
        <p class="text-sm font-semibold text-navy-900">Additional Market Coverage</p>
        <p class="mt-1 text-sm text-navy-500">Analyze 7 more forex pairs.</p>
        <button
          type="button"
          (click)="upgrade.emit()"
          class="mt-4 inline-flex items-center justify-center rounded-lg bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          Unlock Premium
        </button>
      </div>
    </div>
  `
})
export class CompactPreviewsComponent {
  readonly previews = input.required<CompactPreview[]>();

  @Output() upgrade = new EventEmitter<void>();

  label(preview: CompactPreview): string {
    return sentimentLabel(preview.dailyBias, preview.signalState);
  }
}
