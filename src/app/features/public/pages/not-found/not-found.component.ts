import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../../core/services/seo.service';
import { LogoComponent } from '../../../../shared/ui/logo.component';
import { APP_ROUTES } from '../../../../core/config/app-routes';

@Component({
  selector: 'fx-not-found',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div class="w-full max-w-md text-center">
        <fx-logo variant="primary" [heightPx]="36" />
        <p class="mt-8 font-display text-5xl font-bold text-navy-900">404</p>
        <h1 class="mt-3 text-xl font-semibold text-navy-900">This page drifted off the chart</h1>
        <p class="mt-2 text-sm leading-relaxed text-navy-600">
          The page you're looking for doesn't exist or has moved. Let's get you back to familiar
          ground.
        </p>
        <a
          [routerLink]="routes.dashboard"
          class="mt-6 inline-flex items-center justify-center rounded-lg bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
          >Back to Dashboard</a
        >
        <p class="mt-3 text-sm text-navy-500">
          or
          <a [routerLink]="routes.landing" class="font-semibold text-accent hover:underline"
            >return home</a
          >
        </p>
      </div>
    </section>
  `
})
export class NotFoundComponent {
  readonly routes = APP_ROUTES;

  constructor() {
    inject(SeoService).apply({ title: 'Page not found' });
  }
}
