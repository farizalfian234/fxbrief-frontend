import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { PageScaffoldComponent } from '../../../../shared/ui/page-scaffold.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-weekly-recap-detail',
  standalone: true,
  imports: [PageScaffoldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fx-page-scaffold
      eyebrow="Weekly recap"
      [heading]="slug"
      description="Weekly recap content arrives in Phase 6D."
    />
  `
})
export class WeeklyRecapDetailComponent {
  private readonly seo = inject(SeoService);

  @Input({ required: true })
  set slug(value: string) {
    this.slugValue = value;
    this.seo.apply({ title: value, url: `https://fx-brief.com/weekly-recap/${value}` });
  }
  get slug(): string {
    return this.slugValue;
  }
  private slugValue = '';
}
