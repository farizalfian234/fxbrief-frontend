import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';

import { SeoService } from '../../../../core/services/seo.service';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AdminWeeklySummaryApiService } from '../../services/admin-weekly-summary-api.service';
import { WeeklySummaryDetail } from '../../models/weekly-summary.models';
import { formatDate, formatTimestamp, statusBadgeClass } from '../../util/admin-format.util';

type View = 'loading' | 'ready' | 'error';

@Component({
  selector: 'fx-admin-weekly-recap-review',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-bold text-navy-900">Review weekly recap</h1>
      <button
        type="button"
        (click)="back()"
        class="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-navy-700 transition hover:bg-surface-muted"
      >
        Back
      </button>
    </div>

    @if (banner(); as msg) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ msg }}</p>
    }
    @if (notice(); as msg) {
      <p class="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{{ msg }}</p>
    }

    @if (view() === 'loading') {
      <div class="mt-6 h-96 animate-pulse rounded-2xl bg-white"></div>
    }

    @if (view() === 'ready' && summary(); as s) {
      <div class="mt-6 rounded-2xl border border-surface-border bg-white p-5">
        <div class="flex flex-wrap items-center gap-3">
          <span class="rounded-full px-2 py-0.5 text-xs font-semibold" [class]="badge(s.status)">
            {{ s.status }}
          </span>
          <span class="text-sm text-navy-500">
            {{ formatDate(s.weekStart) }} – {{ formatDate(s.weekEnd) }}
          </span>
          @if (s.publishedAt) {
            <span class="text-xs text-navy-400">Published {{ formatTimestamp(s.publishedAt) }}</span>
          }
        </div>
        <h2 class="mt-3 font-display text-lg font-bold text-navy-900">{{ s.title }}</h2>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Claude draft (read-only) -->
        <div class="rounded-2xl border border-surface-border bg-white p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-navy-400">Claude draft (read-only)</p>
          <div class="mt-3 max-h-[28rem] overflow-auto whitespace-pre-line rounded-lg bg-surface-muted px-4 py-3 text-sm leading-relaxed text-navy-700">
            {{ s.claudeDraft }}
          </div>
        </div>

        <!-- Admin editable content -->
        <div class="rounded-2xl border border-surface-border bg-white p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-navy-400">Admin content</p>
          <textarea
            [(ngModel)]="adminContent"
            rows="18"
            maxlength="50000"
            placeholder="Edit the recap before publishing…"
            class="mt-3 w-full resize-y rounded-lg border border-surface-border px-3 py-2.5 text-sm leading-relaxed text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          ></textarea>
          <div class="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              [disabled]="busy()"
              (click)="save()"
              class="inline-flex flex-1 items-center justify-center rounded-lg border border-navy-600 px-4 py-2.5 text-sm font-semibold text-navy-700 transition hover:bg-surface-muted disabled:opacity-60"
            >
              @if (busy() && action() === 'save') {
                <i class="pi pi-spinner animate-spin"></i>
              } @else {
                Save
              }
            </button>
            <button
              type="button"
              [disabled]="busy()"
              (click)="publish()"
              class="inline-flex flex-1 items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
            >
              @if (busy() && action() === 'publish') {
                <i class="pi pi-spinner animate-spin"></i>
              } @else {
                Publish Now
              }
            </button>
          </div>
        </div>
      </div>
    }

    @if (view() === 'error') {
      <div class="mt-6 rounded-2xl border border-surface-border bg-white p-8 text-center">
        <p class="text-sm font-semibold text-navy-900">Could not load this recap</p>
        <button
          type="button"
          (click)="back()"
          class="mt-3 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-navy-700 transition hover:bg-surface-muted"
        >
          Back to list
        </button>
      </div>
    }
  `
})
export class AdminWeeklyRecapReviewComponent implements OnInit {
  private readonly api = inject(AdminWeeklySummaryApiService);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);

  @Input() id?: string;

  recapId: number | null = null;
  adminContent = '';

  readonly view = signal<View>('loading');
  readonly summary = signal<WeeklySummaryDetail | null>(null);
  readonly busy = signal(false);
  readonly action = signal<'save' | 'publish' | null>(null);
  readonly banner = signal('');
  readonly notice = signal('');

  readonly formatDate = formatDate;
  readonly formatTimestamp = formatTimestamp;

  ngOnInit(): void {
    this.seo.apply({ title: 'Review weekly recap' });
    const parsed = Number(this.id);
    if (!this.id || Number.isNaN(parsed)) {
      this.view.set('error');
      return;
    }
    this.recapId = parsed;
    this.fetch(parsed);
  }

  private fetch(id: number): void {
    this.view.set('loading');
    this.api.detail(id).subscribe({
      next: (s) => {
        this.hydrate(s);
        this.view.set('ready');
      },
      error: (err) => {
        this.banner.set(messageForError(err));
        this.view.set('error');
      }
    });
  }

  private hydrate(s: WeeklySummaryDetail): void {
    this.summary.set(s);
    // Seed the editor with existing admin content, or the Claude draft as a
    // starting point the first time the summary is reviewed.
    this.adminContent = s.adminContent ?? s.claudeDraft ?? '';
  }

  badge(status: WeeklySummaryDetail['status']): string {
    return statusBadgeClass(status);
  }

  private validate(): boolean {
    if (!this.adminContent.trim()) {
      this.banner.set('Admin content is required.');
      return false;
    }
    return true;
  }

  save(): void {
    if (this.recapId == null || !this.validate()) {
      return;
    }
    this.action.set('save');
    this.run(this.api.save(this.recapId, { adminContent: this.adminContent }), 'Saved.');
  }

  publish(): void {
    if (this.recapId == null || !this.validate()) {
      return;
    }
    const id = this.recapId;
    this.action.set('publish');
    // Save the latest edits first, then publish, so Publish Now never ships
    // stale content from a prior save.
    this.run(
      this.api
        .save(id, { adminContent: this.adminContent })
        .pipe(switchMap(() => this.api.publish(id))),
      'Recap published.'
    );
  }

  private run(call: Observable<WeeklySummaryDetail>, success: string): void {
    this.banner.set('');
    this.notice.set('');
    this.busy.set(true);
    call.subscribe({
      next: (s) => {
        this.busy.set(false);
        this.action.set(null);
        this.hydrate(s);
        this.notice.set(success);
      },
      error: (err) => {
        this.busy.set(false);
        this.action.set(null);
        this.banner.set(messageForError(err));
      }
    });
  }

  back(): void {
    void this.router.navigateByUrl('/admin/weekly-recap');
  }
}
