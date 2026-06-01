import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'fx-page-scaffold',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
      <p class="text-xs font-semibold uppercase tracking-widest text-accent">{{ eyebrow }}</p>
      <h1 class="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">{{ heading }}</h1>
      @if (description) {
        <p class="mt-3 max-w-2xl text-base text-navy-600">{{ description }}</p>
      }
      <ng-content />
    </section>
  `
})
export class PageScaffoldComponent {
  @Input({ required: true }) heading = '';
  @Input() eyebrow = 'FX–Brief';
  @Input() description = '';
}
