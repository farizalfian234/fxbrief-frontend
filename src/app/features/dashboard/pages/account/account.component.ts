import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';

import { SeoService } from '../../../../core/services/seo.service';
import { AuthSessionStore } from '../../../../core/auth/auth-session.store';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AuthApiService } from '../../../auth/services/auth-api.service';
import { SubscriptionApiService } from '../../../subscription/services/subscription-api.service';
import { PreferencesApiService } from '../../../preferences/services/preferences-api.service';
import { Subscription } from '../../../subscription/models/subscription.models';
import {
  PreferenceOptions,
  PreferenceType,
  UserPreference
} from '../../../preferences/models/preferences.models';

import {
  PreferencePickerComponent,
  PreferenceSelection
} from '../../../preferences/components/preference-picker.component';
import { TopUpModalComponent } from '../../../subscription/components/top-up-modal.component';
import { FeedbackModalComponent } from '../../../feedback/components/feedback-modal.component';

@Component({
  selector: 'fx-account',
  standalone: true,
  imports: [PreferencePickerComponent, TopUpModalComponent, FeedbackModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="font-display text-2xl font-bold text-navy-900">Account</h1>

    @if (banner(); as msg) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ msg }}</p>
    }
    @if (notice(); as msg) {
      <p class="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{{ msg }}</p>
    }

    <div class="mt-6 space-y-5">
      <!-- Profile -->
      <section class="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
        <h2 class="font-display text-lg font-bold text-navy-900">Profile</h2>
        <dl class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium text-navy-400">Name</dt>
            <dd class="mt-0.5 text-sm font-semibold text-navy-900">{{ name() }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-navy-400">Email</dt>
            <dd class="mt-0.5 text-sm font-semibold text-navy-900">{{ email() }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-navy-400">Plan</dt>
            <dd class="mt-0.5 text-sm font-semibold text-navy-900">
              {{ subscription()?.effectivePlan?.name ?? '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-navy-400">Reports remaining</dt>
            <dd class="mt-0.5 text-sm font-semibold text-navy-900">
              {{ subscription()?.remainingReports ?? '—' }}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          (click)="topUpOpen.set(true)"
          class="mt-5 inline-flex items-center justify-center rounded-lg bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          Top Up
        </button>
      </section>

      <!-- Market preference -->
      <section class="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
        <h2 class="font-display text-lg font-bold text-navy-900">Market preference</h2>
        <p class="mt-1 text-sm text-navy-500">
          Optional. Market quality always comes first — your preference refines pair prioritization
          but never overrides objectively better setups.
        </p>
        @if (preferenceOptions(); as opts) {
          <div class="mt-4">
            <fx-preference-picker
              [options]="opts"
              [initialType]="savedType()"
              [initialValue]="savedValue()"
              (selectionChange)="onSelectionChange($event)"
            />
          </div>
          <div class="mt-4 flex gap-3">
            <button
              type="button"
              (click)="savePreference()"
              [disabled]="prefBusy() || !canSave()"
              class="inline-flex items-center justify-center rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              (click)="clearPreference()"
              [disabled]="prefBusy()"
              class="inline-flex items-center justify-center rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-navy-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        }
      </section>

      <!-- Feedback -->
      <section class="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
        <button
          type="button"
          (click)="feedbackOpen.set(true)"
          class="inline-flex items-center justify-center rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-navy-700 transition hover:bg-surface-muted"
        >
          Send feedback
        </button>
      </section>

      <!-- Danger zone -->
      <section class="rounded-2xl border border-red-200 bg-white p-5 sm:p-6">
        <h2 class="font-display text-lg font-bold text-navy-900">Delete account</h2>
        <p class="mt-1 text-sm text-navy-500">
          Your account will be permanently deleted 30 days after you request deletion. You can cancel
          within that window by logging back in.
        </p>
        @if (deletionRequested()) {
          <p class="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Deletion requested. Your account is scheduled for deletion on {{ deletionDate() }}.
          </p>
        } @else if (confirmingDelete()) {
          <div class="mt-4 rounded-lg bg-red-50 p-4">
            <p class="text-sm font-medium text-red-700">
              Are you sure? This schedules permanent deletion in 30 days.
            </p>
            <div class="mt-3 flex gap-3">
              <button
                type="button"
                (click)="requestDeletion()"
                [disabled]="deleteBusy()"
                class="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                Yes, request deletion
              </button>
              <button
                type="button"
                (click)="confirmingDelete.set(false)"
                [disabled]="deleteBusy()"
                class="inline-flex items-center justify-center rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-navy-700 transition hover:bg-surface-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        } @else {
          <button
            type="button"
            (click)="confirmingDelete.set(true)"
            class="mt-4 inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Request account deletion
          </button>
        }
      </section>
    </div>

    @if (topUpOpen()) {
      <fx-top-up-modal
        [remainingReports]="subscription()?.remainingReports ?? 0"
        (paid)="onPaid()"
        (close)="topUpOpen.set(false)"
      />
    }
    @if (feedbackOpen()) {
      <fx-feedback-modal (close)="feedbackOpen.set(false)" />
    }
  `
})
export class AccountComponent {
  private readonly session = inject(AuthSessionStore);
  private readonly auth = inject(AuthApiService);
  private readonly subscriptionApi = inject(SubscriptionApiService);
  private readonly preferencesApi = inject(PreferencesApiService);


  readonly name = this.session.displayName;
  readonly email = computed(() => this.session.session()?.email ?? '');

  readonly subscription = signal<Subscription | null>(null);
  readonly preferenceOptions = signal<PreferenceOptions | null>(null);
  readonly savedType = signal<PreferenceType | null>(null);
  readonly savedValue = signal<string | null>(null);

  readonly topUpOpen = signal(false);
  readonly feedbackOpen = signal(false);
  readonly confirmingDelete = signal(false);
  readonly deletionRequested = signal(false);
  readonly deletionDate = signal('');

  readonly prefBusy = signal(false);
  readonly deleteBusy = signal(false);
  readonly banner = signal('');
  readonly notice = signal('');

  private readonly selection = signal<PreferenceSelection>({
    preferenceType: null,
    preferenceValue: null
  });

  private readonly picker = viewChild(PreferencePickerComponent);

  /**
   * Save is enabled only when the current selection differs from the saved
   * baseline AND is itself a valid state — meaning both fields are filled (a new
   * preference) or both are empty (clearing a previously saved preference). A
   * partial selection (one field filled) is never savable, and reverting to the
   * saved state disables Save again.
   */
  readonly canSave = computed(() => {
    const sel = this.selection();
    const bothFilled = !!sel.preferenceType && !!sel.preferenceValue;
    const bothEmpty = !sel.preferenceType && !sel.preferenceValue;
    const valid = bothFilled || bothEmpty;

    const changed =
      sel.preferenceType !== this.savedType() || sel.preferenceValue !== this.savedValue();

    return valid && changed;
  });

  constructor() {
    inject(SeoService).apply({ title: 'Account' });
    this.subscriptionApi.get().subscribe({
      next: (s) => this.subscription.set(s),
      error: (err) => this.banner.set(messageForError(err))
    });
    this.preferencesApi.options().subscribe({ next: (o) => this.preferenceOptions.set(o) });
    this.preferencesApi.get().subscribe({ next: (p) => this.seedPreference(p) });
  }

  private seedPreference(pref: UserPreference): void {
    if (pref.set && pref.preferenceType && pref.preferenceValue) {
      this.savedType.set(pref.preferenceType);
      this.savedValue.set(pref.preferenceValue);
      this.selection.set({
        preferenceType: pref.preferenceType,
        preferenceValue: pref.preferenceValue
      });
    } else {
      this.savedType.set(null);
      this.savedValue.set(null);
      this.selection.set({ preferenceType: null, preferenceValue: null });
    }
  }

  onSelectionChange(selection: PreferenceSelection): void {
    this.selection.set(selection);
  }

  /**
   * Save commits the current selection. Both fields filled performs a PUT; both
   * empty (clearing a previously saved preference) performs a DELETE. Partial
   * states are not savable and are blocked by canSave.
   */
  savePreference(): void {
    const sel = this.selection();
    if (!this.canSave()) {
      return;
    }
    if (sel.preferenceType && sel.preferenceValue) {
      this.prefBusy.set(true);
      this.notice.set('');
      this.banner.set('');
      this.preferencesApi
        .save({ preferenceType: sel.preferenceType, preferenceValue: sel.preferenceValue })
        .subscribe({
          next: (pref) => {
            this.prefBusy.set(false);
            this.seedPreference(pref);
            this.notice.set('Preference saved.');
          },
          error: (err) => {
            this.prefBusy.set(false);
            this.banner.set(messageForError(err));
          }
        });
    } else {
      this.runClear();
    }
  }

  /** Clear button: DELETE and immediately reset both dropdowns visually. */
  clearPreference(): void {
    this.picker()?.reset();
    this.runClear();
  }

  private runClear(): void {
    this.prefBusy.set(true);
    this.notice.set('');
    this.banner.set('');
    this.preferencesApi.clear().subscribe({
      next: () => {
        this.prefBusy.set(false);
        this.savedType.set(null);
        this.savedValue.set(null);
        this.selection.set({ preferenceType: null, preferenceValue: null });
        this.notice.set('Preference cleared.');
      },
      error: (err) => {
        this.prefBusy.set(false);
        this.banner.set(messageForError(err));
      }
    });
  }

  requestDeletion(): void {
    this.deleteBusy.set(true);
    this.auth.requestDeletion().subscribe({
      next: (res) => {
        this.deleteBusy.set(false);
        this.confirmingDelete.set(false);
        this.deletionRequested.set(true);
        this.deletionDate.set(new Date(res.deletionDate).toLocaleDateString());
      },
      error: (err) => {
        this.deleteBusy.set(false);
        this.banner.set(messageForError(err));
      }
    });
  }

  onPaid(): void {
    this.topUpOpen.set(false);
    this.subscriptionApi.get().subscribe({ next: (s) => this.subscription.set(s) });
  }
}
