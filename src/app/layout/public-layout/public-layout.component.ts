import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LogoComponent } from '../../shared/ui/logo.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'fx-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col">
      <header class="sticky top-0 z-30 border-b border-surface-border bg-white/90 backdrop-blur">
        <div class="mx-auto flex max-w-content items-center justify-between px-5 py-3 sm:px-8">
          <a routerLink="/" aria-label="FX–Brief home">
            <fx-logo variant="primary" [heightPx]="32" />
          </a>

          <nav class="hidden items-center gap-6 text-sm font-medium text-navy-700 md:flex">
            <a routerLink="/articles" routerLinkActive="text-accent" class="transition hover:text-accent">Articles</a>
            <a routerLink="/weekly-recap" routerLinkActive="text-accent" class="transition hover:text-accent">Weekly recap</a>
            <a routerLink="/about" routerLinkActive="text-accent" class="transition hover:text-accent">About</a>
          </nav>

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
  `
})
export class PublicLayoutComponent {}
