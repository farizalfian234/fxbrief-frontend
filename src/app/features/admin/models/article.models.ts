export type ArticleStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type ArticleCategory =
  | 'WEEKLY_RECAP'
  | 'EDUCATIONAL'
  | 'FOREX_BASICS'
  | 'MACRO_INSIGHTS'
  | 'PLATFORM_UPDATES'
  | 'TRADING_PSYCHOLOGY';

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  'WEEKLY_RECAP',
  'EDUCATIONAL',
  'FOREX_BASICS',
  'MACRO_INSIGHTS',
  'PLATFORM_UPDATES',
  'TRADING_PSYCHOLOGY'
];

export const ARTICLE_STATUSES: ArticleStatus[] = [
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'ARCHIVED'
];

export interface ArticleListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: ArticleCategory;
  tags: string[] | null;
  featuredImageUrl: string | null;
  readingTimeMinutes: number;
  status: ArticleStatus;
  scheduledPublishAt: string | null;
  publishedAt: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ArticlePage {
  items: ArticleListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ArticleListFilter {
  page?: number;
  status?: ArticleStatus;
  category?: ArticleCategory;
}

export interface ArticleSaveRequest {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  category: ArticleCategory;
  tags?: string[];
  featuredImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  scheduledPublishAt?: string | null;
  status?: ArticleStatus;
}
