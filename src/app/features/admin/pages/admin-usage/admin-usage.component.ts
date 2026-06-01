import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-admin-usage',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Admin" heading="Usage" description="Usage analytics. Content arrives in Phase 6C." />
  `
})
export class AdminUsageComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Admin Usage' });
  }
}
