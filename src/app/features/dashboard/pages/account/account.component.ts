import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-account',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Account" heading="Account" description="Manage your account. Content arrives in Phase 6B." />
  `
})
export class AccountComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Account' });
  }
}
