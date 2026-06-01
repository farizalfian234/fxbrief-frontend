import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-history',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="History" heading="Report History" description="Your past reports. Content arrives in Phase 6B." />
  `
})
export class HistoryComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Report History' });
  }
}
