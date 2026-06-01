import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-admin-dashboard',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Admin" heading="Admin Dashboard" description="Admin overview. Content arrives in Phase 6C." />
  `
})
export class AdminDashboardComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Admin Dashboard' });
  }
}
