import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-support',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Support" heading="Support" description="Reach our support team here." />
  `
})
export class SupportComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Support' });
  }
}
