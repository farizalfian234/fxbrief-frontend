import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../../core/services/seo.service';
import { LogoComponent } from '../../../../shared/ui/logo.component';
import { APP_ROUTES } from '../../../../core/config/app-routes';

@Component({
  selector: 'fx-server-error',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div class="w-full max-w-md text-center">
        <fx-logo variant="primary" [heightPx]="36" />
        <p class="mt-8 font-display text-5xl font-bold text-navy-900">500</p>
        <h1 class="mt-3 text-xl font-semibold text-navy-900">Something went wrong on our end</h1>
        <p class="mt-2 text-sm leading-relaxed text-navy-600">
          We hit an unexpected error. Try refreshing the page. If it keeps happening, let us know
          using the Feedback button on your Account page.
        </p>
        <button
          type="button"
          (click)="reload()"
          class="mt-6 inline-flex items-center justify-center rounded-lg bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          Refresh
        </button>
        <p class="mt-3 text-sm text-navy-500">
          or
          <a [routerLink]="routes.dashboard" class="font-semibold text-accent hover:underline"
            >go to Dashboard</a
          >
        </p>
      </div>
    </section>
  `
})
export class ServerErrorComponent {
  readonly routes = APP_ROUTES;

  constructor() {
    inject(SeoService).apply({ title: 'Something went wrong' });
  }

  reload(): void {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
}
