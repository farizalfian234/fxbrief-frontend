import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SeoService } from '../../../../core/services/seo.service';
import { APP_ROUTES } from '../../../../core/config/app-routes';
import { errorCodeOf, messageForError } from '../../../../shared/util/api-error.util';
import { AuthApiService } from '../../services/auth-api.service';

function passwordsMatch(group: AbstractControl): { mismatch: true } | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'fx-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-surface-border sm:p-8">
      @if (done()) {
        <div class="text-center">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <i class="pi pi-check text-xl"></i>
          </span>
          <h1 class="mt-4 text-2xl font-bold text-navy-900">Password updated</h1>
          <p class="mt-2 text-sm text-navy-600">
            Your password has been changed. You can now log in with your new password.
          </p>
          <a
            [routerLink]="routes.login"
            class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >Go to login</a
          >
        </div>
      } @else if (!token) {
        <div class="text-center">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <i class="pi pi-times text-xl"></i>
          </span>
          <h1 class="mt-4 text-2xl font-bold text-navy-900">Invalid reset link</h1>
          <p class="mt-2 text-sm text-navy-600">
            This password reset link is invalid. Please request a new one.
          </p>
          <a
            [routerLink]="routes.forgotPassword"
            class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >Request new link</a
          >
        </div>
      } @else {
        <h1 class="text-2xl font-bold text-navy-900">Set a new password</h1>
        <p class="mt-1 text-sm text-navy-500">Choose a strong password you don't use elsewhere.</p>

        @if (formError()) {
          <p class="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {{ formError() }}
          </p>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4" novalidate>
          <div>
            <label for="password" class="block text-sm font-medium text-navy-700">New password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="new-password"
              class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              [class.border-red-400]="invalid('password')"
            />
            @if (invalid('password')) {
              <p class="mt-1 text-xs text-red-600">Password must be at least 8 characters.</p>
            }
          </div>

          <div>
            <label for="confirm" class="block text-sm font-medium text-navy-700">Confirm password</label>
            <input
              id="confirm"
              type="password"
              formControlName="confirm"
              autocomplete="new-password"
              class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              [class.border-red-400]="showMismatch()"
            />
            @if (showMismatch()) {
              <p class="mt-1 text-xs text-red-600">Passwords do not match.</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="busy()"
            class="inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            @if (busy()) {
              <i class="pi pi-spinner animate-spin"></i>
            } @else {
              Update password
            }
          </button>
        </form>
      }
    </div>
  `
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthApiService);
  private readonly route = inject(ActivatedRoute);

  readonly routes = APP_ROUTES;
  readonly token = this.route.snapshot.queryParamMap.get('token');

  readonly busy = signal(false);
  readonly formError = signal('');
  readonly done = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]]
    },
    { validators: passwordsMatch }
  );

  invalid(control: 'password' | 'confirm'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  showMismatch(): boolean {
    return (
      this.form.hasError('mismatch') &&
      this.form.controls.confirm.dirty &&
      this.form.controls.confirm.value.length > 0
    );
  }

  submit(): void {
    if (this.busy() || !this.token) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formError.set('');
    this.busy.set(true);

    this.auth
      .resetPassword({ token: this.token, newPassword: this.form.controls.password.value })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.done.set(true);
        },
        error: (err) => {
          this.busy.set(false);
          const code = errorCodeOf(err);
          if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || code === 'TOKEN_ALREADY_USED') {
            this.formError.set('This reset link has expired or already been used. Please request a new one.');
          } else {
            this.formError.set(messageForError(err));
          }
        }
      });
  }

  constructor() {
    inject(SeoService).apply({
      title: 'Set a new password',
      description: 'Set a new password for your FX–Brief account.',
      url: 'https://fx-brief.com/reset-password',
      canonical: 'https://fx-brief.com/reset-password'
    });
  }
}
