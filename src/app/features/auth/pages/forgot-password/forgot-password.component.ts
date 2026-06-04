import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SeoService } from '../../../../core/services/seo.service';
import { APP_ROUTES } from '../../../../core/config/app-routes';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'fx-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-surface-border sm:p-8">
      @if (submitted()) {
        <div class="text-center">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <i class="pi pi-envelope text-xl"></i>
          </span>
          <h1 class="mt-4 text-2xl font-bold text-navy-900">Check your inbox</h1>
          <p class="mt-2 text-sm leading-relaxed text-navy-600">
            If an account exists for that email, we've sent a link to reset your password. The link
            is valid for a limited time.
          </p>
          <a
            [routerLink]="routes.login"
            class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >Back to login</a
          >
        </div>
      } @else {
        <h1 class="text-2xl font-bold text-navy-900">Reset your password</h1>
        <p class="mt-1 text-sm text-navy-500">
          Enter your email and we'll send you a link to set a new password.
        </p>

        @if (formError()) {
          <p class="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {{ formError() }}
          </p>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4" novalidate>
          <div>
            <label for="email" class="block text-sm font-medium text-navy-700">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              [class.border-red-400]="invalid()"
            />
            @if (invalid()) {
              <p class="mt-1 text-xs text-red-600">Enter a valid email address.</p>
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
              Send reset link
            }
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-navy-500">
          Remembered it?
          <a [routerLink]="routes.login" class="font-semibold text-accent hover:underline">Log in</a>
        </p>
      }
    </div>
  `
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthApiService);

  readonly routes = APP_ROUTES;
  readonly busy = signal(false);
  readonly formError = signal('');
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  invalid(): boolean {
    const c = this.form.controls.email;
    return c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.busy()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formError.set('');
    this.busy.set(true);

    this.auth.forgotPassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.busy.set(false);
        this.submitted.set(true);
      },
      error: (err) => {
        this.busy.set(false);
        this.formError.set(messageForError(err));
      }
    });
  }

  constructor() {
    inject(SeoService).apply({
      title: 'Reset your password',
      description: 'Request a password reset link for your FX–Brief account.',
      url: 'https://fx-brief.com/forgot-password',
      canonical: 'https://fx-brief.com/forgot-password'
    });
  }
}
