import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-privacy',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Legal" heading="Privacy Policy" description="Our privacy policy will be published here." />
  `
})
export class PrivacyComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Privacy Policy' });
  }
}
