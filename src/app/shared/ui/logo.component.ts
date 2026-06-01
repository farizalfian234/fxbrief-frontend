import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type LogoVariant = 'primary' | 'white';

@Component({
  selector: 'fx-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img
      [attr.src]="src"
      [style.height.px]="heightPx"
      class="w-auto select-none"
      alt="FX–Brief"
      draggable="false"
    />
  `
})
export class LogoComponent {
  @Input() variant: LogoVariant = 'primary';
  @Input() heightPx = 32;

  get src(): string {
    return `assets/images/logo-${this.variant}.png`;
  }
}
