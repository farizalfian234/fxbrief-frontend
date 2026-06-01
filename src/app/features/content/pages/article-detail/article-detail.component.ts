import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-article-detail',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold
      eyebrow="Article"
      [heading]="slug"
      description="Article content arrives in Phase 6D."
    />
  `
})
export class ArticleDetailComponent {
  private readonly seo = inject(SeoService);

  @Input({ required: true })
  set slug(value: string) {
    this.slugValue = value;
    this.seo.apply({ title: value, url: `https://fx-brief.com/articles/${value}` });
  }
  get slug(): string {
    return this.slugValue;
  }
  private slugValue = '';
}
