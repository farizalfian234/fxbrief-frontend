import { ArticleCategory } from '../models/content.models';

/** Formats an ISO date or timestamp as `Jun 3, 2026` in UTC, or a dash when absent. */
export function formatPublishedDate(iso: string | null | undefined): string {
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

/** Turns an UPPER_SNAKE category into a Title Case label (WEEKLY_RECAP → Weekly Recap). */
export function categoryLabel(category: ArticleCategory | string): string {
  return category
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
