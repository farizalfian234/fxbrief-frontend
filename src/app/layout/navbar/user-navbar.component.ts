import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoComponent } from '../../shared/ui/logo.component';
import { AuthApiService } from '../../features/auth/services/auth-api.service';

@Component({
  selector: 'fx-user-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 border-b border-navy-700 bg-navy-800 text-white">
      <div class="mx-auto flex max-w-content items-center justify-between px-5 py-3 sm:px-8">
        <a routerLink="/dashboard" aria-label="FX–Brief dashboard">
          <fx-logo variant="white" [heightPx]="32" />
        </a>

        <nav class="hidden items-center gap-1 md:flex">
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
          class="rounded-lg p-2 text-navy-100 transition hover:bg-navy-700 md:hidden"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Toggle navigation"
          (click)="toggleMenu()"
        >
          <i class="pi" [class.pi-bars]="!menuOpen()" [class.pi-times]="menuOpen()"></i>
        </button>
      </div>

      @if (menuOpen()) {
        <nav class="border-t border-navy-700 px-5 py-2 sm:px-8 md:hidden">
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
export class UserNavbarComponent {
  private readonly auth = inject(AuthApiService);

  readonly menuOpen = signal(false);

  readonly navItems = [
    { label: 'Dashboard', path: '/dashboard', exact: true },
    { label: 'History', path: '/history', exact: false },
    { label: 'Account', path: '/account', exact: false }
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
