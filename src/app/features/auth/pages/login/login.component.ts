import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-login',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Welcome back" heading="Log in" description="Sign-in form arrives in Phase 6B." />
  `
})
export class LoginComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Log in' });
  }
}
