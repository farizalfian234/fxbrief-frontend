import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SeoService } from '../../../../core/services/seo.service';
import { APP_ROUTES } from '../../../../core/config/app-routes';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AuthApiService } from '../../services/auth-api.service';
import { GoogleAuthService } from '../../services/google-auth.service';

@Component({
  selector: 'fx-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-surface-border sm:p-8">
      @if (registered()) {
        <div class="text-center">
          <span
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"
          >
            <i class="pi pi-envelope text-xl"></i>
          </span>
          <h1 class="mt-4 text-2xl font-bold text-navy-900">Check your inbox</h1>
          <p class="mt-2 text-sm leading-relaxed text-navy-600">
            We've sent a verification link to
            <strong class="text-navy-900">{{ submittedEmail() }}</strong>. Click the link to
            verify your email, then log in to start with your 3 free reports.
          </p>
          <a
            [routerLink]="routes.login"
            class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >Go to login</a
          >
        </div>
      } @else {
        <h1 class="text-2xl font-bold text-navy-900">Create your account</h1>
        <p class="mt-1 text-sm text-navy-500">Start with 3 free reports — no credit card needed.</p>

        @if (formError()) {
          <p class="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {{ formError() }}
          </p>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4" novalidate>
          <div>
            <label for="name" class="block text-sm font-medium text-navy-700">Name</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              autocomplete="name"
              class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              [class.border-red-400]="invalid('name')"
            />
            @if (invalid('name')) {
              <p class="mt-1 text-xs text-red-600">Please enter your name.</p>
            }
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-navy-700">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              [class.border-red-400]="invalid('email')"
            />
            @if (invalid('email')) {
              <p class="mt-1 text-xs text-red-600">Enter a valid email address.</p>
            }
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-navy-700">Password</label>
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

          <button
            type="submit"
            [disabled]="busy()"
            class="inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            @if (busy()) {
              <i class="pi pi-spinner animate-spin"></i>
            } @else {
              Create account
            }
          </button>
        </form>

        <div class="my-6 flex items-center gap-3">
          <span class="h-px flex-1 bg-surface-border"></span>
          <span class="text-xs font-medium uppercase tracking-wide text-navy-400">or</span>
          <span class="h-px flex-1 bg-surface-border"></span>
        </div>

        <button
          type="button"
          (click)="registerWithGoogle()"
          [disabled]="busy() || !googleAvailable"
          [title]="googleAvailable ? '' : 'Google sign-in coming soon'"
          class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i class="pi pi-google text-base"></i>
          Continue with Google
        </button>

        <p class="mt-6 text-center text-sm text-navy-500">
          Already have an account?
          <a [routerLink]="routes.login" class="font-semibold text-accent hover:underline">Log in</a>
        </p>
      }
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthApiService);
  private readonly google = inject(GoogleAuthService);
  private readonly router = inject(Router);

  readonly routes = APP_ROUTES;
  readonly googleAvailable = this.google.available;

  readonly busy = signal(false);
  readonly formError = signal('');
  readonly registered = signal(false);
  readonly submittedEmail = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  invalid(control: 'name' | 'email' | 'password'): boolean {
    const c = this.form.controls[control];
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
    const email = this.form.controls.email.value;

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.busy.set(false);
        this.submittedEmail.set(email);
        this.registered.set(true);
      },
      error: (err) => {
        this.busy.set(false);
        this.formError.set(
          messageForError(err, {
            EMAIL_ALREADY_REGISTERED:
              'An account with this email already exists. Try logging in instead.'
          })
        );
      }
    });
  }

  async registerWithGoogle(): Promise<void> {
    if (this.busy() || !this.googleAvailable) {
      return;
    }
    this.formError.set('');
    this.busy.set(true);
    try {
      const idToken = await this.google.requestIdToken();
      this.auth.loginWithGoogle({ idToken }).subscribe({
        next: (session) => {
          const target =
            session.role === 'ADMIN' ? APP_ROUTES.adminDashboard : APP_ROUTES.dashboard;
          void this.router.navigateByUrl(target);
        },
        error: (err) => {
          this.busy.set(false);
          this.formError.set(messageForError(err));
        }
      });
    } catch {
      this.busy.set(false);
      this.formError.set('Google sign-in was cancelled or could not be completed.');
    }
  }

  constructor() {
    inject(SeoService).apply({
      title: 'Create your account',
      description: 'Register for FX–Brief and get 3 free forex analysis reports — no credit card needed.',
      url: 'https://fx-brief.com/register',
      canonical: 'https://fx-brief.com/register'
    });
  }
}
