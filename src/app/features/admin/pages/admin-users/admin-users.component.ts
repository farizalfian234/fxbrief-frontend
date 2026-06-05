import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { SeoService } from '../../../../core/services/seo.service';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminPaginationComponent } from '../../components/admin-pagination.component';
import { AdminTopUpModalComponent } from '../../components/admin-top-up-modal.component';
import { AdminUser, AdminUserPage } from '../../models/admin.models';
import { formatDate, formatTimestamp, planBadgeClass } from '../../util/admin-format.util';

type View = 'loading' | 'ready';

@Component({
  selector: 'fx-admin-users',
  standalone: true,
  imports: [AdminPaginationComponent, AdminTopUpModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="font-display text-2xl font-bold text-navy-900">Users</h1>

    @if (banner(); as msg) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ msg }}</p>
    }
    @if (notice(); as msg) {
      <p class="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{{ msg }}</p>
    }

    @if (view() === 'loading') {
      <div class="mt-6 h-64 animate-pulse rounded-2xl bg-white"></div>
    }

    @if (view() === 'ready' && page(); as pg) {
      @if (!pg.items.length) {
        <div class="mt-6 rounded-2xl border border-surface-border bg-white p-8 text-center">
          <p class="text-sm font-semibold text-navy-900">No users found</p>
        </div>
      } @else {
        <div class="mt-6 overflow-x-auto rounded-2xl border border-surface-border bg-white">
          <table class="w-full min-w-[920px] text-left text-sm">
            <thead class="border-b border-surface-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-navy-500">
              <tr>
                <th class="px-4 py-3">Name</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Plan</th>
                <th class="px-4 py-3">Remaining</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Paid</th>
                <th class="px-4 py-3">Last generated</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (u of pg.items; track u.id) {
                <tr class="border-b border-surface-border last:border-0 align-top">
                  <td class="px-4 py-3 text-navy-800">
                    <div class="font-medium">{{ u.name }}</div>
                    @if (u.deletionRequestedAt) {
                      <span class="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        Pending deletion · {{ formatDate(u.deletionRequestedAt) }}
                      </span>
                    }
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-navy-600">{{ u.email }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold" [class]="planClass(u)">
                      {{ u.plan }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-navy-700">{{ u.remainingReports }}</td>
                  <td class="px-4 py-3">
                    @if (u.active) {
                      <span class="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                        <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span> Active
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 text-xs font-semibold text-navy-400">
                        <span class="h-1.5 w-1.5 rounded-full bg-navy-300"></span> Inactive
                      </span>
                    }
                  </td>
                  <td class="px-4 py-3 text-navy-600">{{ u.hasEverPaid ? 'Yes' : 'No' }}</td>
                  <td class="whitespace-nowrap px-4 py-3 text-navy-600">
                    {{ formatTimestamp(u.lastGeneratedAt) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-right">
                    <div class="flex justify-end gap-2">
                      <button
                        type="button"
                        (click)="openTopUp(u)"
                        class="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-surface-muted"
                      >
                        Top up
                      </button>
                      @if (u.active) {
                        <button
                          type="button"
                          [disabled]="busyId() === u.id"
                          (click)="setActive(u, false)"
                          class="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      } @else {
                        <button
                          type="button"
                          [disabled]="busyId() === u.id"
                          (click)="setActive(u, true)"
                          class="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:opacity-50"
                        >
                          Activate
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <fx-admin-pagination [page]="pg.page" [totalPages]="pg.totalPages" (change)="goTo($event)" />
      }
    }

    @if (topUpUser(); as u) {
      <fx-admin-top-up-modal
        [user]="u"
        (done)="onToppedUp($event.userId)"
        (close)="topUpUser.set(null)"
      />
    }
  `
})
export class AdminUsersComponent {
  private readonly api = inject(AdminApiService);

  readonly view = signal<View>('loading');
  readonly page = signal<AdminUserPage | null>(null);
  readonly banner = signal('');
  readonly notice = signal('');
  readonly busyId = signal<number | null>(null);
  readonly topUpUser = signal<AdminUser | null>(null);

  readonly formatDate = formatDate;
  readonly formatTimestamp = formatTimestamp;

  constructor() {
    inject(SeoService).apply({ title: 'Users' });
    this.load(1);
  }

  private load(page: number): void {
    this.view.set('loading');
    this.api.users(page).subscribe({
      next: (pg) => {
        this.page.set(pg);
        this.view.set('ready');
      },
      error: (err) => {
        this.banner.set(messageForError(err));
        this.view.set('ready');
      }
    });
  }

  goTo(page: number): void {
    if (page < 1) {
      return;
    }
    this.load(page);
  }

  planClass(u: AdminUser): string {
    return planBadgeClass(u.plan);
  }

  openTopUp(u: AdminUser): void {
    this.notice.set('');
    this.banner.set('');
    this.topUpUser.set(u);
  }

  onToppedUp(userId: number): void {
    this.topUpUser.set(null);
    this.notice.set('Top-up applied.');
    this.reloadCurrent();
    void userId;
  }

  setActive(u: AdminUser, active: boolean): void {
    this.notice.set('');
    this.banner.set('');
    this.busyId.set(u.id);
    const call = active ? this.api.activate(u.id) : this.api.deactivate(u.id);
    call.subscribe({
      next: () => {
        this.busyId.set(null);
        this.notice.set(active ? 'Account activated.' : 'Account deactivated.');
        this.reloadCurrent();
      },
      error: (err) => {
        this.busyId.set(null);
        this.banner.set(messageForError(err));
      }
    });
  }

  private reloadCurrent(): void {
    this.load(this.page()?.page ?? 1);
  }
}
