import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-dashboard',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Dashboard" heading="Dashboard" description="Your analysis dashboard. Content arrives in Phase 6B." />
  `
})
export class DashboardComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Dashboard' });
  }
}
