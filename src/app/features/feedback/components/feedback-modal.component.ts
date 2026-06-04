import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { messageForError } from '../../../shared/util/api-error.util';
import { FeedbackApiService } from '../services/feedback-api.service';

/**
 * Feedback modal launched from the Account page. A single message field is sent
 * to the backend; on success a thank-you state is shown. The parent owns
 * visibility and closes the modal.
 */
@Component({
  selector: 'fx-feedback-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/60 px-4 py-6 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-lg font-bold text-navy-900">Send feedback</h2>
          <button
            type="button"
            (click)="close.emit()"
            class="rounded-lg p-1.5 text-navy-400 transition hover:bg-surface-muted"
            aria-label="Close"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        @if (sent()) {
          <div class="mt-4 text-center">
            <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <i class="pi pi-check text-xl"></i>
            </span>
            <p class="mt-3 text-sm font-semibold text-navy-900">Thank you for your feedback</p>
            <p class="mt-1 text-sm text-navy-500">We read every message and appreciate you reaching out.</p>
            <button
              type="button"
              (click)="close.emit()"
              class="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >
              Done
            </button>
          </div>
        } @else {
          <p class="mt-2 text-sm text-navy-500">
            Questions, issues, or ideas — tell us anything. We'd love to hear from you.
          </p>

          @if (errorMessage()) {
            <p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-4" novalidate>
            <textarea
              formControlName="content"
              rows="5"
              maxlength="5000"
              placeholder="Your message…"
              class="w-full resize-none rounded-lg border border-surface-border px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            ></textarea>
            <button
              type="submit"
              [disabled]="busy()"
              class="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              @if (busy()) {
                <i class="pi pi-spinner animate-spin"></i>
              } @else {
                Send feedback
              }
            </button>
          </form>
        }
      </div>
    </div>
  `
})
export class FeedbackModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly feedbackApi = inject(FeedbackApiService);

  @Output() close = new EventEmitter<void>();

  readonly busy = signal(false);
  readonly sent = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(5000)]]
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
    this.feedbackApi.submit(this.form.getRawValue()).subscribe({
      next: () => {
        this.busy.set(false);
        this.sent.set(true);
      },
      error: (err) => {
        this.busy.set(false);
        this.errorMessage.set(messageForError(err));
      }
    });
  }
}
