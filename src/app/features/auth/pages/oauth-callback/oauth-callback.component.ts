import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SeoService } from '../../../../core/services/seo.service';
import { APP_ROUTES } from '../../../../core/config/app-routes';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AuthApiService } from '../../services/auth-api.service';

/**
 * Landing route for redirect-style OAuth returns. The primary Google flow uses
 * the Identity Services popup, which returns the ID token directly to the page
 * that initiated it, so this route is only reached if a redirect-style flow is
 * configured later. It handles a credential passed back on the URL fragment or
 * query string, and otherwise returns the user to login rather than stranding
 * them on a blank page.
 */
@Component({
  selector: 'fx-oauth-callback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-surface-border sm:p-8">
      <span class="mx-auto flex h-12 w-12 items-center justify-center text-navy-400">
        <i class="pi pi-spinner animate-spin text-2xl"></i>
      </span>
      <h1 class="mt-4 text-2xl font-bold text-navy-900">Completing sign-in</h1>
      <p class="mt-2 text-sm text-navy-600">{{ message() }}</p>
    </div>
  `
})
export class OauthCallbackComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthApiService);

  readonly message = signal('Please wait while we complete your sign-in.');

  constructor() {
    inject(SeoService).apply({ title: 'Completing sign-in' });

    const fragment = this.route.snapshot.fragment ?? '';
    const fragmentToken = new URLSearchParams(fragment).get('id_token');
    const queryToken = this.route.snapshot.queryParamMap.get('credential');
    const idToken = fragmentToken ?? queryToken;

    if (!idToken) {
      this.message.set('Returning you to login…');
      void this.router.navigateByUrl(APP_ROUTES.login);
      return;
    }

    this.auth.loginWithGoogle({ idToken }).subscribe({
      next: (session) => {
        const target =
          session.role === 'ADMIN' ? APP_ROUTES.adminDashboard : APP_ROUTES.dashboard;
        void this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.message.set(messageForError(err));
        setTimeout(() => void this.router.navigateByUrl(APP_ROUTES.login), 2500);
      }
    });
  }
}
