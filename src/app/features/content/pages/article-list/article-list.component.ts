import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-article-list',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold eyebrow="Articles" heading="Articles" description="Educational and market articles. Content arrives in Phase 6D." />
  `
})
export class ArticleListComponent {
  constructor() {
    inject(SeoService).apply({ title: 'Articles' });
  }
}
