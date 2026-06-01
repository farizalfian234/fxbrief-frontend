import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../../core/services/seo.service';
import { LogoComponent } from '../../../../shared/ui/logo.component';

@Component({
  selector: 'fx-not-found',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-5 text-center">
      <fx-logo variant="primary" [heightPx]="48" />
      <p class="mt-8 text-sm font-semibold uppercase tracking-widest text-accent">404</p>
      <h1 class="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">Page not found</h1>
      <p class="mt-3 max-w-md text-navy-600">
        The page you are looking for doesn't exist or has moved.
      </p>
      <a
        routerLink="/"
        class="mt-6 rounded-lg bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
        >Back to home</a
      >
    </div>
  `
})
export class NotFoundComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Page not found' });
  }
}
