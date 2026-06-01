import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-verify-email',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold
      eyebrow="Email verification"
      heading="Verify your email"
      description="Email verification handling arrives in Phase 6B."
    />
  `
})
export class VerifyEmailComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Verify your email' });
  }

  // Verification token arrives as ?token=... — wired to the API in Phase 6B.
  @Input() token?: string;
}
