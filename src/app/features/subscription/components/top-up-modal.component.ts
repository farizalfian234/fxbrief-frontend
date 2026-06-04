import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  signal
} from '@angular/core';

import { messageForError, errorCodeOf } from '../../../shared/util/api-error.util';
import { SubscriptionApiService } from '../services/subscription-api.service';
import { MidtransSnapService } from '../services/midtrans-snap.service';
import { TopUpInitiation, TopUpPlan } from '../models/subscription.models';

type Stage = 'choose' | 'confirm' | 'processing';

/**
 * Top-up flow. The user picks Basic ($10) or Premium ($20). If they still have
 * reports remaining, a carry-over warning shows the remaining + 20 = new total
 * calculation before confirming (no warning for zero-remaining users). On
 * confirm the backend initiates the top-up and returns a Snap token, which
 * opens the Midtrans Snap popup. A successful or pending payment notifies the
 * parent to re-fetch subscription and today's report.
 */
@Component({
  selector: 'fx-top-up-modal',
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
          <h2 class="font-display text-lg font-bold text-navy-900">Top up reports</h2>
          <button
            type="button"
            (click)="close.emit()"
            [disabled]="stage() === 'processing'"
            class="rounded-lg p-1.5 text-navy-400 transition hover:bg-surface-muted disabled:opacity-50"
            aria-label="Close"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        @if (errorMessage()) {
          <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
        }

        @switch (stage()) {
          @case ('choose') {
            <p class="mt-2 text-sm text-navy-500">
              Each top-up adds 20 reports. Choose a plan to continue.
            </p>
            <div class="mt-4 space-y-3">
              <button
                type="button"
                (click)="choosePlan('BASIC')"
                class="flex w-full items-center justify-between rounded-xl border border-surface-border px-4 py-3 text-left transition hover:border-navy-400"
              >
                <span>
                  <span class="block font-display text-base font-bold text-navy-900">Basic</span>
                  <span class="block text-xs text-navy-500">Best pair per day · last 10 in history</span>
                </span>
                <span class="font-display text-lg font-bold text-navy-900">$10</span>
              </button>
              <button
                type="button"
                (click)="choosePlan('PREMIUM')"
                class="flex w-full items-center justify-between rounded-xl border border-surface-border px-4 py-3 text-left transition hover:border-navy-400"
              >
                <span>
                  <span class="block font-display text-base font-bold text-navy-900">Premium</span>
                  <span class="block text-xs text-navy-500">All 8 pairs · unlimited history</span>
                </span>
                <span class="font-display text-lg font-bold text-navy-900">$20</span>
              </button>
            </div>
          }

          @case ('confirm') {
            <div class="mt-2">
              @if (initiation(); as init) {
                @if (init.warningFlag) {
                  <div class="rounded-xl bg-surface-muted p-4">
                    <p class="text-sm text-navy-600">
                      You still have reports remaining. Topping up adds them together:
                    </p>
                    <div class="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-navy-900">
                      <span>{{ init.carryOverCalculation.remainingReports }} remaining</span>
                      <span class="text-navy-400">+</span>
                      <span>{{ init.carryOverCalculation.additionalReports }} new</span>
                      <span class="text-navy-400">=</span>
                      <span class="text-accent">{{ init.carryOverCalculation.newTotal }} total</span>
                    </div>
                  </div>
                }
                <p class="mt-4 text-sm text-navy-600">
                  {{ planLabel() }} top-up — <span class="font-semibold text-navy-900">$ {{ planPrice() }}</span>
                  charged in IDR at checkout.
                </p>
                <button
                  type="button"
                  (click)="confirm()"
                  class="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
                >
                  Continue to payment
                </button>
                <button
                  type="button"
                  (click)="backToChoose()"
                  class="mt-2 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-navy-500 transition hover:bg-surface-muted"
                >
                  Back
                </button>
              }
            </div>
          }

          @case ('processing') {
            <div class="mt-6 flex flex-col items-center py-4 text-center">
              <i class="pi pi-spinner animate-spin text-2xl text-navy-400"></i>
              <p class="mt-3 text-sm text-navy-600">Opening secure payment…</p>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class TopUpModalComponent {
  private readonly subscriptionApi = inject(SubscriptionApiService);
  private readonly snap = inject(MidtransSnapService);

  /** Remaining reports, used only to decide stage flow defensively. */
  readonly remainingReports = input(0);

  /** Emitted after a successful/pending payment so the parent can re-fetch. */
  @Output() paid = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  readonly stage = signal<Stage>('choose');
  readonly errorMessage = signal('');
  readonly initiation = signal<TopUpInitiation | null>(null);
  private selectedPlan: TopUpPlan = 'BASIC';

  planLabel(): string {
    return this.selectedPlan === 'PREMIUM' ? 'Premium' : 'Basic';
  }

  planPrice(): number {
    return this.selectedPlan === 'PREMIUM' ? 20 : 10;
  }

  choosePlan(plan: TopUpPlan): void {
    this.selectedPlan = plan;
    this.errorMessage.set('');
    this.stage.set('processing');
    this.subscriptionApi.topUp({ plan }).subscribe({
      next: (init) => {
        this.initiation.set(init);
        this.stage.set('confirm');
      },
      error: (err) => this.handleError(err)
    });
  }

  backToChoose(): void {
    this.initiation.set(null);
    this.stage.set('choose');
  }

  async confirm(): Promise<void> {
    const init = this.initiation();
    if (!init) {
      return;
    }
    this.errorMessage.set('');
    this.stage.set('processing');
    try {
      const result = await this.snap.pay(init.snapToken, init.production);
      if (result === 'closed') {
        // User dismissed the popup; return to confirm so they can retry.
        this.stage.set('confirm');
        return;
      }
      this.paid.emit();
    } catch (err) {
      this.handleError(err);
    }
  }

  private handleError(err: unknown): void {
    const code = errorCodeOf(err);
    if (code === 'PAYMENT_NOT_AVAILABLE') {
      this.errorMessage.set(
        'Payments are not available for your account yet. Please try again later.'
      );
    } else {
      this.errorMessage.set(messageForError(err));
    }
    this.stage.set(this.initiation() ? 'confirm' : 'choose');
  }
}
