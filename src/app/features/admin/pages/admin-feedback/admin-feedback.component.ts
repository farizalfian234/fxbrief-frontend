import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { SeoService } from '../../../../core/services/seo.service';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminPaginationComponent } from '../../components/admin-pagination.component';
import { AdminFeedbackReplyModalComponent } from '../../components/admin-feedback-reply-modal.component';
import { FeedbackPage, FeedbackRow } from '../../models/admin.models';
import { formatTimestamp } from '../../util/admin-format.util';

type View = 'loading' | 'ready';

@Component({
  selector: 'fx-admin-feedback',
  standalone: true,
  imports: [AdminPaginationComponent, AdminFeedbackReplyModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="font-display text-2xl font-bold text-navy-900">Feedback</h1>

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
          <p class="text-sm font-semibold text-navy-900">No feedback yet</p>
        </div>
      } @else {
        <div class="mt-6 overflow-x-auto rounded-2xl border border-surface-border bg-white">
          <table class="w-full min-w-[860px] text-left text-sm">
            <thead class="border-b border-surface-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-navy-500">
              <tr>
                <th class="px-4 py-3">User</th>
                <th class="px-4 py-3">Feedback</th>
                <th class="px-4 py-3">Submitted</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (f of pg.items; track f.id) {
                <tr class="border-b border-surface-border last:border-0 align-top">
                  <td class="px-4 py-3 text-navy-800">
                    <div class="font-medium">{{ f.userName }}</div>
                    <div class="text-xs text-navy-500">{{ f.userEmail }}</div>
                  </td>
                  <td class="px-4 py-3 text-navy-600">
                    <p class="max-w-md whitespace-pre-line">{{ f.content }}</p>
                    @if (f.replied && f.replyContent) {
                      <div class="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-navy-600">
                        <span class="font-semibold text-navy-700">Reply:</span> {{ f.replyContent }}
                      </div>
                    }
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-navy-600">
                    {{ formatTimestamp(f.submittedAt) }}
                  </td>
                  <td class="px-4 py-3">
                    @if (f.replied) {
                      <span class="inline-flex flex-col gap-0.5">
                        <span class="text-xs font-semibold text-green-700">Replied</span>
                        <span class="text-xs text-navy-400">{{ formatTimestamp(f.repliedAt) }}</span>
                      </span>
                    } @else {
                      <span class="text-xs font-semibold text-amber-600">Not replied</span>
                    }
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-right">
                    @if (!f.replied) {
                      <button
                        type="button"
                        (click)="openReply(f)"
                        class="rounded-lg bg-navy-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-700"
                      >
                        Reply
                      </button>
                    } @else {
                      <span class="text-xs text-navy-400">—</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <fx-admin-pagination [page]="pg.page" [totalPages]="pg.totalPages" (change)="goTo($event)" />
      }
    }

    @if (replyTo(); as f) {
      <fx-admin-feedback-reply-modal
        [feedback]="f"
        (done)="onReplied()"
        (close)="replyTo.set(null)"
      />
    }
  `
})
export class AdminFeedbackComponent {
  private readonly api = inject(AdminApiService);

  readonly view = signal<View>('loading');
  readonly page = signal<FeedbackPage | null>(null);
  readonly banner = signal('');
  readonly notice = signal('');
  readonly replyTo = signal<FeedbackRow | null>(null);

  readonly formatTimestamp = formatTimestamp;

  constructor() {
    inject(SeoService).apply({ title: 'Feedback' });
    this.load(1);
  }

  private load(page: number): void {
    this.view.set('loading');
    this.api.feedback(page).subscribe({
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

  openReply(f: FeedbackRow): void {
    this.notice.set('');
    this.banner.set('');
    this.replyTo.set(f);
  }

  onReplied(): void {
    this.replyTo.set(null);
    this.notice.set('Reply sent.');
    this.load(this.page()?.page ?? 1);
  }
}
