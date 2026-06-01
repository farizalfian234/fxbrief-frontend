import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-about',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="About" heading="About FX–Brief & Help" description="Learn about FX–Brief and find help here." />
  `
})
export class AboutComponent {
  constructor() {
    inject(SeoService).apply({ title: 'About & Help' });
  }
}
