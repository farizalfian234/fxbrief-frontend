import { ArticleCategory, ArticleStatus } from '../models/article.models';
import { PlanCode } from '../models/admin.models';
import { WeeklySummaryStatus } from '../models/weekly-summary.models';

/** Formats an ISO timestamp as `Jun 3, 2026 · 01:30 UTC`, or a dash when absent. */
export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  const date = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  });
  return `${date} · ${time} UTC`;
}

/** Formats an ISO date (or timestamp) as `Jun 3, 2026`, or a dash when absent. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/** Turns an UPPER_SNAKE enum into a Title Case label (e.g. WEEKLY_RECAP → Weekly Recap). */
export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-navy-100 text-navy-700',
  SCHEDULED: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-surface-muted text-navy-400'
};

export function statusBadgeClass(status: ArticleStatus | WeeklySummaryStatus): string {
  return STATUS_BADGE[status] ?? 'bg-navy-100 text-navy-700';
}

const PLAN_BADGE: Record<PlanCode, string> = {
  PREMIUM: 'bg-navy-600 text-white',
  BASIC: 'bg-accent text-white',
  FREE: 'bg-navy-100 text-navy-700'
};

export function planBadgeClass(plan: PlanCode): string {
  return PLAN_BADGE[plan] ?? 'bg-navy-100 text-navy-700';
}

export function categoryLabel(category: ArticleCategory): string {
  return humanizeEnum(category);
}
