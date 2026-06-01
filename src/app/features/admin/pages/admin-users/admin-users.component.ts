import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-admin-users',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Admin" heading="Users" description="User management. Content arrives in Phase 6C." />
  `
})
export class AdminUsersComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Admin Users' });
  }
}
