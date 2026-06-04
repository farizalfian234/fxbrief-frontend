import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SeoService } from '../../../../core/services/seo.service';
import { APP_ROUTES } from '../../../../core/config/app-routes';
import { errorCodeOf } from '../../../../shared/util/api-error.util';
import { AuthApiService } from '../../services/auth-api.service';

type VerifyState = 'verifying' | 'success' | 'expired' | 'invalid' | 'missing';

@Component({
  selector: 'fx-verify-email',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-surface-border sm:p-8">
      @switch (state()) {
        @case ('verifying') {
          <span class="mx-auto flex h-12 w-12 items-center justify-center text-navy-400">
            <i class="pi pi-spinner animate-spin text-2xl"></i>
          </span>
          <h1 class="mt-4 text-2xl font-bold text-navy-900">Verifying your email</h1>
          <p class="mt-2 text-sm text-navy-600">This will only take a moment.</p>
        }
        @case ('success') {
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <i class="pi pi-check text-xl"></i>
          </span>
          <h1 class="mt-4 text-2xl font-bold text-navy-900">Email verified</h1>
          <p class="mt-2 text-sm text-navy-600">
            Your email has been verified. You can now log in and start with your 3 free reports.
          </p>
          <a
            [routerLink]="routes.login"
            class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >Go to login</a
          >
        }
        @case ('expired') {
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <i class="pi pi-clock text-xl"></i>
          </span>
          <h1 class="mt-4 text-2xl font-bold text-navy-900">This link has expired</h1>
          <p class="mt-2 text-sm text-navy-600">
            Verification links are valid for a limited time. Please register again or request a new
            link to continue.
          </p>
          <a
            [routerLink]="routes.register"
            class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >Back to register</a
          >
        }
        @default {
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <i class="pi pi-times text-xl"></i>
          </span>
          <h1 class="mt-4 text-2xl font-bold text-navy-900">Verification link invalid</h1>
          <p class="mt-2 text-sm text-navy-600">
            This verification link is invalid or has already been used. Try logging in, or register
            again if you don't yet have an account.
          </p>
          <a
            [routerLink]="routes.login"
            class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >Go to login</a
          >
        }
      }
    </div>
  `
})
export class VerifyEmailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthApiService);

  readonly routes = APP_ROUTES;
  readonly state = signal<VerifyState>('verifying');

  constructor() {
    inject(SeoService).apply({
      title: 'Verify your email',
      description: 'Verify your FX–Brief email address.',
      url: 'https://fx-brief.com/verify-email',
      canonical: 'https://fx-brief.com/verify-email'
    });

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('missing');
      return;
    }

    this.auth.verifyEmail({ token }).subscribe({
      next: () => this.state.set('success'),
      error: (err) => {
        const code = errorCodeOf(err);
        if (code === 'TOKEN_EXPIRED') {
          this.state.set('expired');
        } else {
          this.state.set('invalid');
        }
      }
    });
  }
}
