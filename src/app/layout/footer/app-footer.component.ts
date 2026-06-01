import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'fx-app-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-surface-border bg-white">
      <div class="mx-auto flex max-w-content flex-col items-center gap-2 px-5 py-5 text-xs text-navy-500 sm:flex-row sm:justify-between sm:px-8">
        <nav class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <a routerLink="/about" class="transition hover:text-accent">About/Help</a>
          <span class="text-surface-border">·</span>
          <a routerLink="/terms" class="transition hover:text-accent">Terms</a>
          <span class="text-surface-border">·</span>
          <a routerLink="/privacy" class="transition hover:text-accent">Privacy</a>
          <span class="text-surface-border">·</span>
          <a routerLink="/support" class="transition hover:text-accent">Support</a>
        </nav>
        <span>© {{ year }} FX–Brief</span>
      </div>
    </footer>
  `
})
export class AppFooterComponent {
  readonly year = new Date().getFullYear();
}
