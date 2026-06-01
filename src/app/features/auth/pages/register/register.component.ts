import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-register',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Get started" heading="Create your account" description="Registration form arrives in Phase 6B." />
  `
})
export class RegisterComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Create your account' });
  }
}
