import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-terms',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Legal" heading="Terms of Service" description="Our terms of service will be published here." />
  `
})
export class TermsComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Terms of Service' });
  }
}
