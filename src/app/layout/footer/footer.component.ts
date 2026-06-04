import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../shared/ui/logo.component';

@Component({
  selector: 'fx-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-surface-border bg-navy-800 text-navy-100">
      <div class="mx-auto flex max-w-content flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div class="space-y-3">
          <fx-logo variant="white" [heightPx]="24" />
          <p class="max-w-xs text-sm text-navy-200">Less Noise. Better Setups.</p>
        </div>

        <nav class="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
          <a routerLink="/about" class="text-navy-200 transition hover:text-white">About/Help</a>
          <a routerLink="/articles" class="text-navy-200 transition hover:text-white">Articles</a>
          <a routerLink="/weekly-recap" class="text-navy-200 transition hover:text-white">Weekly Recap</a>
          <a routerLink="/terms" class="text-navy-200 transition hover:text-white">Terms</a>
          <a routerLink="/privacy" class="text-navy-200 transition hover:text-white">Privacy</a>
          <a routerLink="/support" class="text-navy-200 transition hover:text-white">Support</a>
        </nav>
      </div>

      <div class="border-t border-navy-700">
        <div class="mx-auto max-w-content px-5 py-4 text-xs text-navy-300 sm:px-8">
          © {{ year }} FX–Brief. Analysis only — not financial advice.
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
