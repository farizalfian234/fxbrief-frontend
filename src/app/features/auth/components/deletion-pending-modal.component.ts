import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * Shown immediately after a successful login when the session reports a pending
 * deletion. The user either cancels the deletion (reactivating the account and
 * entering the app) or continues with deletion (logging out). The parent owns
 * the backend calls; this component only renders state and emits intent.
 */
@Component({
  selector: 'fx-deletion-pending-modal',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 px-5 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deletion-modal-title"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div class="flex items-center gap-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600"
          >
            <i class="pi pi-exclamation-triangle text-lg"></i>
          </span>
          <h2 id="deletion-modal-title" class="text-lg font-bold text-navy-900">
            Your account is scheduled for deletion
          </h2>
        </div>

        <p class="mt-4 text-sm leading-relaxed text-navy-600">
          This account is set to be permanently deleted on
          <strong class="text-navy-900">{{ deletionDate | date: 'MMMM d, yyyy' }}</strong
          >. You can keep your account by cancelling the deletion now, or continue and be
          logged out with the deletion still scheduled.
        </p>

        @if (errorMessage()) {
          <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ errorMessage() }}
          </p>
        }

        <div class="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            (click)="onCancelDeletion()"
            [disabled]="busy()"
            class="inline-flex flex-1 items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            @if (busy()) {
              <i class="pi pi-spinner animate-spin"></i>
            } @else {
              Cancel Deletion &amp; Continue
            }
          </button>
          <button
            type="button"
            (click)="continueToDelete.emit()"
            [disabled]="busy()"
            class="inline-flex flex-1 items-center justify-center rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-navy-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue to Delete
          </button>
        </div>
      </div>
    </div>
  `
})
export class DeletionPendingModalComponent {
  @Input() deletionDate?: string;

  /** Emitted when the user chooses to keep the account. */
  @Output() cancelDeletion = new EventEmitter<void>();
  /** Emitted when the user chooses to proceed with deletion (logout). */
  @Output() continueToDelete = new EventEmitter<void>();

  readonly busy = signal(false);
  readonly errorMessage = signal('');

  /** Called by the parent to reflect an in-flight cancel request. */
  setBusy(value: boolean): void {
    this.busy.set(value);
  }

  /** Called by the parent to surface a failed cancel attempt. */
  setError(message: string): void {
    this.errorMessage.set(message);
  }

  onCancelDeletion(): void {
    this.errorMessage.set('');
    this.cancelDeletion.emit();
  }
}
