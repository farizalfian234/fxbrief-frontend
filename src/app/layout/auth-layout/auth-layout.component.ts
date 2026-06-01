import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LogoComponent } from '../../shared/ui/logo.component';

@Component({
  selector: 'fx-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col bg-surface-muted">
      <div class="px-5 py-5 sm:px-8">
        <a routerLink="/" aria-label="FX–Brief home">
          <fx-logo variant="primary" [heightPx]="32" />
        </a>
      </div>
      <main class="flex flex-1 items-start justify-center px-5 pb-16 sm:items-center">
        <div class="w-full max-w-md">
          <router-outlet />
        </div>
      </main>
    </div>
  `
})
export class AuthLayoutComponent {}
