import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal
} from '@angular/core';

import { messageForError } from '../../../shared/util/api-error.util';
import { AdminApiService } from '../services/admin-api.service';
import { AdminUser, TopUpPlan, TopUpResult } from '../models/admin.models';

/**
 * Manual top-up: the admin selects a target plan (Basic or Premium) and the
 * backend adds 20 reports with carry-over and flips has_ever_paid. Plan change
 * is always tied to a top-up — there is no standalone upgrade/downgrade. The
 * parent owns visibility and reloads its row on success.
 */
@Component({
  selector: 'fx-admin-top-up-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/60 px-4 py-6 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-lg font-bold text-navy-900">Manual top-up</h2>
          <button
            type="button"
            (click)="close.emit()"
            class="rounded-lg p-1.5 text-navy-400 transition hover:bg-surface-muted"
            aria-label="Close"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <p class="mt-2 text-sm text-navy-500">
          {{ user.name }} · {{ user.email }}
        </p>
        <p class="mt-1 text-sm text-navy-500">
          Current plan <span class="font-semibold text-navy-700">{{ user.plan }}</span> ·
          {{ user.remainingReports }} reports remaining
        </p>

        @if (errorMessage()) {
          <p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
        }

        <div class="mt-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-navy-400">Target plan</p>
          <div class="mt-2 grid grid-cols-2 gap-2">
            @for (p of plans; track p) {
              <button
                type="button"
                (click)="plan.set(p)"
                class="rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
                [class]="
                  plan() === p
                    ? 'border-navy-600 bg-navy-600 text-white'
                    : 'border-surface-border text-navy-700 hover:bg-surface-muted'
                "
              >
                {{ p }}
              </button>
            }
          </div>
        </div>

        <p class="mt-4 rounded-lg bg-surface-muted px-3 py-2 text-sm text-navy-600">
          Adds 20 reports with carry-over: {{ user.remainingReports }} + 20 =
          <span class="font-semibold text-navy-900">{{ user.remainingReports + 20 }}</span>
        </p>

        <button
          type="button"
          (click)="submit()"
          [disabled]="busy()"
          class="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          @if (busy()) {
            <i class="pi pi-spinner animate-spin"></i>
          } @else {
            Confirm top-up
          }
        </button>
      </div>
    </div>
  `
})
export class AdminTopUpModalComponent {
  private readonly api = inject(AdminApiService);

  @Input({ required: true }) user!: AdminUser;
  @Output() close = new EventEmitter<void>();
  @Output() done = new EventEmitter<TopUpResult>();

  readonly plans: TopUpPlan[] = ['BASIC', 'PREMIUM'];
  readonly plan = signal<TopUpPlan>('BASIC');
  readonly busy = signal(false);
  readonly errorMessage = signal('');

  submit(): void {
    if (this.busy()) {
      return;
    }
    this.errorMessage.set('');
    this.busy.set(true);
    this.api.topUp(this.user.id, this.plan()).subscribe({
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
