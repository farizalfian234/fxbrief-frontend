import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-oauth-callback',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold
      eyebrow="Signing in"
      heading="Completing Google sign-in"
      description="Google sign-in completion arrives in Phase 6B."
    />
  `
})
export class OauthCallbackComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Signing in' });
  }
}
