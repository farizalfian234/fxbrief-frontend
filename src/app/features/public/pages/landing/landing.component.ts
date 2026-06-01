import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-landing',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="AI forex analysis" heading="Clarity before the market opens" description="Structured, AI-assisted forex analysis reports in seconds. Content arrives in a later phase." />
  `
})
export class LandingComponent {
  constructor() {
    inject(SeoService).apply({ title: 'FX–Brief — AI-Powered Forex Analysis' });
  }
}
