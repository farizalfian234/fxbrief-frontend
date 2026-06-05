import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SeoService } from '../../../../core/services/seo.service';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AdminArticleApiService } from '../../services/admin-article-api.service';
import { MarkdownService } from '../../../../shared/services/markdown.service';
import {
  ARTICLE_CATEGORIES,
  ArticleCategory,
  ArticleDetail,
  ArticleSaveRequest,
  ArticleStatus
} from '../../models/article.models';
import { categoryLabel } from '../../util/admin-format.util';

type View = 'loading' | 'ready';

interface EditorForm {
  title: string;
  slug: string;
  slugTouched: boolean;
  category: ArticleCategory;
  tagsInput: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  scheduledPublishAt: string;
}

/** Lowercase, hyphenated, URL-safe slug derived from a title. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Component({
  selector: 'fx-admin-article-editor',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-bold text-navy-900">
        {{ isNew ? 'New article' : 'Edit article' }}
      </h1>
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
    } @else {
      <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Main column -->
        <div class="flex flex-col gap-4 lg:col-span-2">
          <div class="rounded-2xl border border-surface-border bg-white p-5">
            <label class="block">
              <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">Title</span>
              <input
                type="text"
                [(ngModel)]="form.title"
                (ngModelChange)="onTitleChange()"
                maxlength="255"
                class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </label>

            <label class="mt-4 block">
              <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">Slug</span>
              <input
                type="text"
                [(ngModel)]="form.slug"
                (ngModelChange)="form.slugTouched = true"
                maxlength="255"
                class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 font-mono text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <span class="mt-1 block text-xs text-navy-400">Auto-generated from the title; edit if needed.</span>
            </label>
          </div>

          <!-- Markdown editor + preview -->
          <div class="rounded-2xl border border-surface-border bg-white p-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">Content (Markdown)</span>
              <div class="flex gap-1 rounded-lg bg-surface-muted p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  (click)="mobileTab.set('write')"
                  class="rounded-md px-2.5 py-1 transition lg:hidden"
                  [class]="mobileTab() === 'write' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-400'"
                >
                  Write
                </button>
                <button
                  type="button"
                  (click)="mobileTab.set('preview')"
                  class="rounded-md px-2.5 py-1 transition lg:hidden"
                  [class]="mobileTab() === 'preview' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-400'"
                >
                  Preview
                </button>
              </div>
            </div>

            <div class="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <textarea
                [(ngModel)]="form.content"
                (ngModelChange)="syncContent()"
                rows="18"
                [class.hidden]="mobileTab() === 'preview'"
                class="block w-full resize-y rounded-lg border border-surface-border px-3 py-2.5 font-mono text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent lg:!block"
                placeholder="Write Markdown here…"
              ></textarea>
              <div
                [class.hidden]="mobileTab() === 'write'"
                class="prose-preview min-h-[12rem] overflow-auto rounded-lg border border-surface-border bg-surface-muted px-4 py-3 text-sm text-navy-800 lg:!block"
                [innerHTML]="preview()"
              ></div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col gap-4">
          <div class="rounded-2xl border border-surface-border bg-white p-5">
            <label class="block">
              <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">Category</span>
              <select
                [(ngModel)]="form.category"
                class="mt-1 w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              >
                @for (c of categories; track c) {
                  <option [ngValue]="c">{{ categoryLabel(c) }}</option>
                }
              </select>
            </label>

            <label class="mt-4 block">
              <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">Tags</span>
              <input
                type="text"
                [(ngModel)]="form.tagsInput"
                placeholder="comma, separated, tags"
                class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </label>

            <label class="mt-4 block">
              <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">Excerpt</span>
              <textarea
                [(ngModel)]="form.excerpt"
                rows="3"
                maxlength="500"
                class="mt-1 w-full resize-none rounded-lg border border-surface-border px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              ></textarea>
            </label>

            <label class="mt-4 block">
              <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">Featured image URL</span>
              <input
                type="url"
                [(ngModel)]="form.featuredImageUrl"
                maxlength="500"
                placeholder="https://…"
                class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </label>

            <label class="mt-4 block">
              <span class="text-xs font-semibold uppercase tracking-wide text-navy-400">Scheduled publish</span>
              <input
                type="datetime-local"
                [(ngModel)]="form.scheduledPublishAt"
                (ngModelChange)="syncSchedule()"
                [attr.data-empty]="!form.scheduledPublishAt"
                data-placeholder="Not scheduled"
                class="mt-1 block w-full min-w-0 appearance-none rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </label>
          </div>

          <div class="rounded-2xl border border-surface-border bg-white p-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-navy-400">SEO</p>
            <label class="mt-2 block">
              <span class="text-xs text-navy-500">SEO title</span>
              <input
                type="text"
                [(ngModel)]="form.seoTitle"
                maxlength="255"
                class="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </label>
            <label class="mt-3 block">
              <span class="text-xs text-navy-500">SEO description</span>
              <textarea
                [(ngModel)]="form.seoDescription"
                rows="3"
                maxlength="500"
                class="mt-1 w-full resize-none rounded-lg border border-surface-border px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              ></textarea>
            </label>
          </div>

          <div class="flex flex-col gap-2">
            <button
              type="button"
              [disabled]="busy()"
              (click)="saveDraft()"
              class="inline-flex items-center justify-center rounded-lg border border-navy-600 px-4 py-2.5 text-sm font-semibold text-navy-700 transition hover:bg-surface-muted disabled:opacity-60"
            >
              @if (busy() && action() === 'draft') {
                <i class="pi pi-spinner animate-spin"></i>
              } @else {
                Save Draft
              }
            </button>
            <button
              type="button"
              [disabled]="busy() || scheduleInPast()"
              (click)="publishOrSchedule()"
              class="inline-flex items-center justify-center rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
            >
              @if (busy() && (action() === 'publish' || action() === 'schedule')) {
                <i class="pi pi-spinner animate-spin"></i>
              } @else if (isScheduling()) {
                Schedule
              } @else {
                Publish Now
              }
            </button>
            @if (isScheduling()) {
              @if (scheduleInPast()) {
                <p class="text-xs text-red-600">Pick a future date and time to schedule.</p>
              } @else {
                <p class="text-xs text-navy-400">Will publish automatically at the scheduled time.</p>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      /* iOS Safari sizes type=datetime-local to its content, so w-full alone
         leaves the control narrow inside its field. Force it to fill, and restore
         a consistent height + faint placeholder when empty (appearance: none
         strips the native height and placeholder text). */
      input[type='datetime-local'] {
        width: 100%;
        box-sizing: border-box;
        min-height: 38px;
        -webkit-appearance: none;
        appearance: none;
      }
      input[type='datetime-local']::-webkit-date-and-time-value {
        text-align: left;
        margin: 0;
      }
      input[type='datetime-local'][data-empty='true']::before {
        content: attr(data-placeholder);
        color: #94a3b8;
      }
      .prose-preview :is(h1, h2, h3) {
        font-family: 'Sora', system-ui, sans-serif;
        font-weight: 700;
        color: #0d2233;
        margin: 0.75rem 0 0.5rem;
      }
      .prose-preview h1 { font-size: 1.25rem; }
      .prose-preview h2 { font-size: 1.1rem; }
      .prose-preview h3 { font-size: 1rem; }
      .prose-preview p { margin: 0.5rem 0; line-height: 1.6; }
      .prose-preview ul, .prose-preview ol { margin: 0.5rem 0 0.5rem 1.25rem; }
      .prose-preview ul { list-style: disc; }
      .prose-preview ol { list-style: decimal; }
      .prose-preview a { color: #2563eb; text-decoration: underline; }
      .prose-preview code {
        background: #e2e8f0;
        padding: 0.1rem 0.3rem;
        border-radius: 0.25rem;
        font-size: 0.85em;
      }
      .prose-preview pre {
        background: #0d2233;
        color: #f5f7fa;
        padding: 0.75rem;
        border-radius: 0.5rem;
        overflow-x: auto;
      }
      .prose-preview pre code { background: transparent; padding: 0; }
      .prose-preview blockquote {
        border-left: 3px solid #1B4F72;
        padding-left: 0.75rem;
        color: #173f5c;
        margin: 0.5rem 0;
      }
    `
  ]
})
export class AdminArticleEditorComponent implements OnInit {
  private readonly api = inject(AdminArticleApiService);
  private readonly markdown = inject(MarkdownService);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);

  /** Route param: numeric id for edit, or `new` for create. */
  @Input() id?: string;

  isNew = true;
  articleId: number | null = null;

  readonly view = signal<View>('ready');
  readonly busy = signal(false);
  readonly action = signal<'draft' | 'publish' | 'schedule' | null>(null);
  readonly banner = signal('');
  readonly notice = signal('');
  readonly mobileTab = signal<'write' | 'preview'>('write');

  readonly categories = ARTICLE_CATEGORIES;
  readonly categoryLabel = categoryLabel;

  readonly contentSignal = signal('');
  readonly preview = computed(() => this.markdown.render(this.contentSignal()));

  /** Mirrors form.scheduledPublishAt so button label/state can react to it. */
  readonly scheduleSignal = signal('');
  /** A non-empty scheduled-publish field means the primary action is Schedule. */
  readonly isScheduling = computed(() => this.scheduleSignal().trim().length > 0);
  /** True only when a date is set and it is not in the future. */
  readonly scheduleInPast = computed(() => {
    const raw = this.scheduleSignal().trim();
    if (!raw) {
      return false;
    }
    const when = new Date(raw).getTime();
    return Number.isNaN(when) || when <= Date.now();
  });

  form: EditorForm = {
    title: '',
    slug: '',
    slugTouched: false,
    category: 'EDUCATIONAL',
    tagsInput: '',
    content: '',
    excerpt: '',
    featuredImageUrl: '',
    seoTitle: '',
    seoDescription: '',
    scheduledPublishAt: ''
  };

  ngOnInit(): void {
    this.isNew = !this.id || this.id === 'new';
    this.seo.apply({ title: this.isNew ? 'New article' : 'Edit article' });
    if (!this.isNew) {
      const parsed = Number(this.id);
      if (Number.isNaN(parsed)) {
        this.banner.set('Invalid article id.');
        return;
      }
      this.articleId = parsed;
      this.fetch(parsed);
    }
  }

  private fetch(id: number): void {
    this.view.set('loading');
    this.api.detail(id).subscribe({
      next: (a) => {
        this.hydrate(a);
        this.view.set('ready');
      },
      error: (err) => {
        this.banner.set(messageForError(err));
        this.view.set('ready');
      }
    });
  }

  private hydrate(a: ArticleDetail): void {
    this.form = {
      title: a.title,
      slug: a.slug,
      slugTouched: true,
      category: a.category,
      tagsInput: (a.tags ?? []).join(', '),
      content: a.content,
      excerpt: a.excerpt ?? '',
      featuredImageUrl: a.featuredImageUrl ?? '',
      seoTitle: a.seoTitle ?? '',
      seoDescription: a.seoDescription ?? '',
      scheduledPublishAt: a.scheduledPublishAt ? a.scheduledPublishAt.slice(0, 16) : ''
    };
    this.contentSignal.set(a.content);
    this.scheduleSignal.set(this.form.scheduledPublishAt);
  }

  onTitleChange(): void {
    if (!this.form.slugTouched) {
      this.form.slug = slugify(this.form.title);
    }
  }

  /** Keep the preview signal in sync with the ngModel-bound textarea. */
  syncContent(): void {
    this.contentSignal.set(this.form.content);
  }

  /** Keep the schedule signal in sync with the datetime-local field. */
  syncSchedule(): void {
    this.scheduleSignal.set(this.form.scheduledPublishAt);
  }

  private buildRequest(status: ArticleStatus, includeSchedule: boolean): ArticleSaveRequest {
    const tags = this.form.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    return {
      title: this.form.title.trim(),
      slug: this.form.slug.trim() || undefined,
      content: this.form.content,
      excerpt: this.form.excerpt.trim() || undefined,
      category: this.form.category,
      tags: tags.length ? tags : undefined,
      featuredImageUrl: this.form.featuredImageUrl.trim() || undefined,
      seoTitle: this.form.seoTitle.trim() || undefined,
      seoDescription: this.form.seoDescription.trim() || undefined,
      scheduledPublishAt:
        includeSchedule && this.form.scheduledPublishAt
          ? new Date(this.form.scheduledPublishAt).toISOString()
          : null,
      status
    };
  }

  private validate(): boolean {
    if (!this.form.title.trim()) {
      this.banner.set('Title is required.');
      return false;
    }
    if (!this.form.content.trim()) {
      this.banner.set('Content is required.');
      return false;
    }
    return true;
  }

  saveDraft(): void {
    this.syncContent();
    if (!this.validate()) {
      return;
    }
    this.action.set('draft');
    // A draft never carries a schedule: strip scheduledPublishAt on save.
    this.persist(this.buildRequest('DRAFT', false), 'Draft saved.');
  }

  /** Primary action: Schedule when a future date is set, otherwise Publish Now. */
  publishOrSchedule(): void {
    if (this.isScheduling()) {
      this.schedule();
    } else {
      this.publishNow();
    }
  }

  private publishNow(): void {
    this.syncContent();
    if (!this.validate()) {
      return;
    }
    this.action.set('publish');
    this.persist(this.buildRequest('PUBLISHED', false), 'Article published.');
  }

  private schedule(): void {
    this.syncContent();
    if (!this.validate()) {
      return;
    }
    if (this.scheduleInPast()) {
      this.banner.set('Scheduled time must be in the future.');
      return;
    }
    this.action.set('schedule');
    this.persist(this.buildRequest('SCHEDULED', true), 'Article scheduled.');
  }

  private persist(body: ArticleSaveRequest, success: string): void {
    this.banner.set('');
    this.notice.set('');
    this.busy.set(true);
    const call =
      this.isNew || this.articleId == null
        ? this.api.create(body)
        : this.api.update(this.articleId, body);
    call.subscribe({
      next: (saved) => {
        this.busy.set(false);
        this.action.set(null);
        this.isNew = false;
        this.articleId = saved.id;
        this.hydrate(saved);
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
    void this.router.navigateByUrl('/admin/articles');
  }
}
