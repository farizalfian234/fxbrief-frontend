import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { AuthSessionStore } from '../../core/auth/auth-session.store';
import { LogoComponent } from '../../shared/ui/logo.component';
import { FooterComponent } from '../footer/footer.component';
import { AppFooterComponent } from '../footer/app-footer.component';
import { UserNavbarComponent } from '../navbar/user-navbar.component';

/**
 * Shell for the public information and error pages (about, privacy, terms,
 * support, 403, 500, 404). These pages are publicly reachable, but when an
 * authenticated user lands on one — typically via the in-app footer — the page
 * keeps the user's own chrome (the authenticated navbar and the minimal user
 * footer) instead of the marketing header, so the user never feels dropped out
 * of the app. Logged-out visitors get the marketing header and full footer.
 *
 * The content itself is identical in both states; only the surrounding chrome
 * switches on the session signal. The routes are not guarded — auth state only
 * selects chrome, it never gates access.
 */
@Component({
  selector: 'fx-info-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    LogoComponent,
    FooterComponent,
    AppFooterComponent,
    UserNavbarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAuthenticated()) {
      <div class="flex min-h-screen flex-col bg-surface-muted">
        <fx-user-navbar />
        <main class="flex-1">
          <router-outlet />
        </main>
        <fx-app-footer />
      </div>
    } @else {
      <div class="flex min-h-screen flex-col">
        <header class="sticky top-0 z-30 border-b border-surface-border bg-white/90 backdrop-blur">
          <div class="mx-auto flex max-w-content items-center justify-between px-5 py-3 sm:px-8">
            <a routerLink="/" aria-label="FX–Brief home">
              <fx-logo variant="primary" [heightPx]="32" />
            </a>
            <div class="flex items-center gap-3">
              <a
                routerLink="/login"
                class="text-sm font-medium text-navy-700 transition hover:text-accent"
                >Log in</a
              >
              <a
                routerLink="/register"
                class="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
                >Get started</a
              >
            </div>
          </div>
        </header>
        <main class="flex-1">
          <router-outlet />
        </main>
        <fx-footer />
      </div>
    }
  `
})
export class InfoLayoutComponent {
  readonly isAuthenticated = inject(AuthSessionStore).isAuthenticated;
}
