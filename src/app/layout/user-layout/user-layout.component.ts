import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserNavbarComponent } from '../navbar/user-navbar.component';

@Component({
  selector: 'fx-user-layout',
  standalone: true,
  imports: [RouterOutlet, UserNavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col bg-surface-muted">
      <fx-user-navbar />
      <main class="flex-1">
        <div class="mx-auto max-w-content px-5 py-6 sm:px-8 sm:py-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `
})
export class UserLayoutComponent {}
