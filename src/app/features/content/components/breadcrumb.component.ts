import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  /** Router path; omit for the current (last) item. */
  link?: string;
}

@Component({
  selector: 'fx-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm text-navy-500">
        @for (item of items; track item.label; let last = $last) {
          <li class="flex items-center gap-1.5">
            @if (item.link && !last) {
              <a [routerLink]="item.link" class="transition hover:text-accent">{{ item.label }}</a>
              <span class="text-navy-300" aria-hidden="true">/</span>
            } @else {
              <span class="font-medium text-navy-700" aria-current="page">{{ item.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `
})
export class BreadcrumbComponent {
  @Input({ required: true }) items: BreadcrumbItem[] = [];
}
