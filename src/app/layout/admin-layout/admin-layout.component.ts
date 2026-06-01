import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminNavbarComponent } from '../navbar/admin-navbar.component';

@Component({
  selector: 'fx-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminNavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col bg-surface-muted">
      <fx-admin-navbar />
      <main class="flex-1">
        <div class="mx-auto max-w-content px-5 py-6 sm:px-8 sm:py-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {}
