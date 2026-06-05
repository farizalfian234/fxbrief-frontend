import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'fx-content-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages > 1) {
      <div class="mt-10 flex items-center justify-center gap-3">
        <button
          type="button"
          (click)="change.emit(page - 1)"
          [disabled]="page <= 1"
          class="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-navy-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span class="text-sm text-navy-500">Page {{ page }} of {{ totalPages }}</span>
        <button
          type="button"
          (click)="change.emit(page + 1)"
          [disabled]="page >= totalPages"
          class="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-navy-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    }
  `
})
export class ContentPaginationComponent {
  @Input({ required: true }) page = 1;
  @Input({ required: true }) totalPages = 1;
  @Output() change = new EventEmitter<number>();
}
