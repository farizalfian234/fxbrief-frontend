export type WeeklySummaryStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export const WEEKLY_SUMMARY_STATUSES: WeeklySummaryStatus[] = [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED'
];

export interface WeeklySummaryListItem {
  id: number;
  title: string;
  slug: string;
  weekStart: string;
  weekEnd: string;
  status: WeeklySummaryStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummaryDetail extends WeeklySummaryListItem {
  claudeDraft: string;
  adminContent: string | null;
}

export interface WeeklySummaryPage {
  items: WeeklySummaryListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WeeklySummaryListFilter {
  page?: number;
  status?: WeeklySummaryStatus;
}

export interface WeeklySummarySaveRequest {
  adminContent: string;
  status?: WeeklySummaryStatus;
}
