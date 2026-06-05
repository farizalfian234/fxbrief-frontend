import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoComponent } from '../../shared/ui/logo.component';
import { AuthApiService } from '../../features/auth/services/auth-api.service';

@Component({
  selector: 'fx-admin-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 border-b border-navy-700 bg-navy-900 text-white">
      <div class="mx-auto flex max-w-content items-center justify-between px-5 py-3 sm:px-8">
        <div class="flex items-center gap-3">
          <a routerLink="/admin" aria-label="FX–Brief admin">
            <fx-logo variant="white" [heightPx]="32" />
          </a>
          <span class="rounded-md bg-navy-700 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-navy-100">
            Admin
          </span>
        </div>

        <nav class="hidden items-center gap-1 lg:flex">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-navy-700 text-white"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="rounded-lg px-3 py-2 text-sm font-medium text-navy-100 transition hover:bg-navy-700 hover:text-white"
              >{{ item.label }}</a
            >
          }
          <button
            type="button"
            (click)="logout()"
            class="ml-2 rounded-lg border border-navy-600 px-3 py-2 text-sm font-medium text-navy-100 transition hover:bg-navy-700 hover:text-white"
          >
            Logout
          </button>
        </nav>

        <button
          type="button"
          class="rounded-lg p-2 text-navy-100 transition hover:bg-navy-700 lg:hidden"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Toggle navigation"
          (click)="toggleMenu()"
        >
          <i class="pi" [class.pi-bars]="!menuOpen()" [class.pi-times]="menuOpen()"></i>
        </button>
      </div>

      @if (menuOpen()) {
        <nav class="border-t border-navy-700 px-5 py-2 sm:px-8 lg:hidden">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-navy-700 text-white"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              (click)="closeMenu()"
              class="block rounded-lg px-3 py-2 text-sm font-medium text-navy-100 transition hover:bg-navy-700"
              >{{ item.label }}</a
            >
          }
          <button
            type="button"
            (click)="logout()"
            class="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-navy-100 transition hover:bg-navy-700"
          >
            Logout
          </button>
        </nav>
      }
    </header>
  `
})
export class AdminNavbarComponent {
  private readonly auth = inject(AuthApiService);

  readonly menuOpen = signal(false);

  readonly navItems = [
    { label: 'Dashboard', path: '/admin', exact: true },
    { label: 'Users', path: '/admin/users', exact: false },
    { label: 'Usage', path: '/admin/usage', exact: false },
    { label: 'Feedback', path: '/admin/feedback', exact: false },
    { label: 'Articles', path: '/admin/articles', exact: false },
    { label: 'Weekly Recaps', path: '/admin/weekly-recap', exact: false }
  ];

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.closeMenu();
    this.auth.logout();
  }
}
