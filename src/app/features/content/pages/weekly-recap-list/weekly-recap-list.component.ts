import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-weekly-recap-list',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Weekly recap" heading="Weekly Market Recap" description="Weekly market summaries. Content arrives in Phase 6D." />
  `
})
export class WeeklyRecapListComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Weekly Market Recap' });
  }
}
