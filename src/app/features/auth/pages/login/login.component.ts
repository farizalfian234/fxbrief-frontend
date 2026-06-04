import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SeoService } from '../../../../core/services/seo.service';
import { AuthSessionStore } from '../../../../core/auth/auth-session.store';
import { APP_ROUTES } from '../../../../core/config/app-routes';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AuthApiService } from '../../services/auth-api.service';
import { GoogleAuthService } from '../../services/google-auth.service';
import { AuthSession } from '../../models/auth.models';
import { DeletionPendingModalComponent } from '../../components/deletion-pending-modal.component';

@Component({
  selector: 'fx-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DeletionPendingModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-surface-border sm:p-8">
      <h1 class="text-2xl font-bold text-navy-900">Welcome back</h1>
      <p class="mt-1 text-sm text-navy-500">Log in to your FX–Brief account.</p>

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
            [class.border-red-400]="invalid('email')"
          />
          @if (invalid('email')) {
            <p class="mt-1 text-xs text-red-600">Enter a valid email address.</p>
          }
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium text-navy-700">Password</label>
            <a [routerLink]="routes.forgotPassword" class="text-xs font-medium text-accent hover:underline"
              >Forgot password?</a
            >
          </div>
          <input
            id="password"
            type="password"
            formControlName="password"
            autocomplete="current-password"
            class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            [class.border-red-400]="invalid('password')"
          />
          @if (invalid('password')) {
            <p class="mt-1 text-xs text-red-600">Password is required.</p>
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
            Log in
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
        (click)="loginWithGoogle()"
        [disabled]="busy() || !googleAvailable"
        [title]="googleAvailable ? '' : 'Google sign-in coming soon'"
        class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <i class="pi pi-google text-base"></i>
        Continue with Google
      </button>

      <p class="mt-6 text-center text-sm text-navy-500">
        Don't have an account?
        <a [routerLink]="routes.register" class="font-semibold text-accent hover:underline">Sign up</a>
      </p>
    </div>

    @if (pendingSession(); as session) {
      <fx-deletion-pending-modal
        #modal
        [deletionDate]="session.deletionDate"
        (cancelDeletion)="cancelDeletion(session)"
        (continueToDelete)="continueToDelete()"
      />
    }
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthApiService);
  private readonly google = inject(GoogleAuthService);
  private readonly sessionStore = inject(AuthSessionStore);
  private readonly router = inject(Router);

  private readonly modal = viewChild(DeletionPendingModalComponent);

  readonly routes = APP_ROUTES;
  readonly googleAvailable = this.google.available;

  readonly busy = signal(false);
  readonly formError = signal('');
  readonly pendingSession = signal<AuthSession | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  invalid(control: 'email' | 'password'): boolean {
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

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (session) => this.afterAuth(session),
      error: (err) => {
        this.busy.set(false);
        this.formError.set(messageForError(err));
      }
    });
  }

  async loginWithGoogle(): Promise<void> {
    if (this.busy() || !this.googleAvailable) {
      return;
    }
    this.formError.set('');
    this.busy.set(true);
    try {
      const idToken = await this.google.requestIdToken();
      this.auth.loginWithGoogle({ idToken }).subscribe({
        next: (session) => this.afterAuth(session),
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

  cancelDeletion(session: AuthSession): void {
    const modal = this.modal();
    modal?.setBusy(true);
    this.auth.cancelDeletion().subscribe({
      next: () => {
        this.sessionStore.setSession({ ...session, deletionPending: false, deletionDate: undefined });
        this.pendingSession.set(null);
        this.redirectByRole(session);
      },
      error: (err) => {
        modal?.setBusy(false);
        modal?.setError(messageForError(err));
      }
    });
  }

  continueToDelete(): void {
    this.pendingSession.set(null);
    this.sessionStore.clear();
    this.busy.set(false);
    void this.router.navigateByUrl(APP_ROUTES.login);
  }

  private afterAuth(session: AuthSession): void {
    if (session.deletionPending) {
      // Session is already stored by the service; hold entry until the user decides.
      this.pendingSession.set(session);
      this.busy.set(false);
      return;
    }
    this.redirectByRole(session);
  }

  private redirectByRole(session: AuthSession): void {
    const target = session.role === 'ADMIN' ? APP_ROUTES.adminDashboard : APP_ROUTES.dashboard;
    void this.router.navigateByUrl(target);
  }

  constructor() {
    inject(SeoService).apply({ title: 'Log in' });
  }
}
