import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-admin-feedback',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Admin" heading="Feedback" description="Feedback management. Content arrives in Phase 6C." />
  `
})
export class AdminFeedbackComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Admin Feedback' });
  }
}
