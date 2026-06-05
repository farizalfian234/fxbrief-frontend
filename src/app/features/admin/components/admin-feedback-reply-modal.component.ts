import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { messageForError } from '../../../shared/util/api-error.util';
import { AdminApiService } from '../services/admin-api.service';
import { FeedbackReplyResult, FeedbackRow } from '../models/admin.models';

/**
 * Reply to a single feedback submission. On send the backend records the reply,
 * marks the row REPLIED, and emails the user. The parent owns visibility and
 * refreshes its list on success.
 */
@Component({
  selector: 'fx-admin-feedback-reply-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/60 px-4 py-6 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-lg font-bold text-navy-900">Reply to feedback</h2>
          <button
            type="button"
            (click)="close.emit()"
            class="rounded-lg p-1.5 text-navy-400 transition hover:bg-surface-muted"
            aria-label="Close"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <p class="mt-2 text-sm text-navy-500">{{ feedback.userName }} · {{ feedback.userEmail }}</p>

        <blockquote class="mt-3 rounded-lg bg-surface-muted px-3 py-2 text-sm text-navy-700">
          {{ feedback.content }}
        </blockquote>

        @if (errorMessage()) {
          <p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-4" novalidate>
          <label class="block text-xs font-semibold uppercase tracking-wide text-navy-400">
            Your reply
          </label>
          <textarea
            formControlName="replyContent"
            rows="5"
            maxlength="5000"
            placeholder="Write your reply…"
            class="mt-1 w-full resize-none rounded-lg border border-surface-border px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          ></textarea>
          <p class="mt-1 text-xs text-navy-400">This reply is emailed to the user automatically.</p>
          <div class="mt-4 flex gap-2">
            <button
              type="button"
              (click)="close.emit()"
              class="flex-1 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-medium text-navy-700 transition hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="busy()"
              class="inline-flex flex-1 items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              @if (busy()) {
                <i class="pi pi-spinner animate-spin"></i>
              } @else {
                Send reply
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AdminFeedbackReplyModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AdminApiService);

  @Input({ required: true }) feedback!: FeedbackRow;
  @Output() close = new EventEmitter<void>();
  @Output() done = new EventEmitter<FeedbackReplyResult>();

  readonly busy = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    replyContent: ['', [Validators.required, Validators.maxLength(5000)]]
  });

  submit(): void {
    if (this.busy()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set('');
    this.busy.set(true);
    this.api.replyFeedback(this.feedback.id, this.form.getRawValue().replyContent).subscribe({
      next: (res) => {
        this.busy.set(false);
        this.done.emit(res);
      },
      error: (err) => {
        this.busy.set(false);
        this.errorMessage.set(messageForError(err));
      }
    });
  }
}
