import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-forgot-password',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Account recovery" heading="Forgot password" description="Password reset request form arrives in Phase 6B." />
  `
})
export class ForgotPasswordComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Forgot password' });
  }
}
