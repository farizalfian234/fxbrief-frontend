import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../../core/services/seo.service';
import { APP_ROUTES } from '../../../../core/config/app-routes';

@Component({
  selector: 'fx-support',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
      <header class="max-w-3xl">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent">Support</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">Support</h1>
      </header>

      <div class="mt-8 max-w-2xl space-y-4 text-base leading-relaxed text-navy-600">
        <p class="text-lg font-medium text-navy-900">Need help with FX–Brief?</p>
        <p>
          For account or billing inquiries, please log in and use the Feedback button on your Account
          page. We read every message and respond as soon as possible.
        </p>
        <p>
          Don't have an account yet?
          <a [routerLink]="routes.register" class="font-semibold text-accent hover:underline"
            >Register for free</a
          >
          and get 3 reports to try FX–Brief before committing.
        </p>
      </div>
    </article>
  `
})
export class SupportComponent {
  readonly routes = APP_ROUTES;

  constructor() {
    inject(SeoService).apply({
      title: 'Support',
      description: 'Get help with FX–Brief. Account and billing support for registered users.',
      url: 'https://fx-brief.com/support',
      canonical: 'https://fx-brief.com/support'
    });
  }
}
