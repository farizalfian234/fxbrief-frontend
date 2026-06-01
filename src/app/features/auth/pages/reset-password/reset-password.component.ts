import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-reset-password',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold
      eyebrow="Account recovery"
      heading="Reset password"
      description="Password reset form arrives in Phase 6B."
    />
  `
})
export class ResetPasswordComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Reset password' });
  }

  // Reset token arrives as ?token=... — wired to the API in Phase 6B.
  @Input() token?: string;
}
