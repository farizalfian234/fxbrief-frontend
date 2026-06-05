export type ArticleCategory =
  | 'WEEKLY_RECAP'
  | 'EDUCATIONAL'
  | 'FOREX_BASICS'
  | 'MACRO_INSIGHTS'
  | 'PLATFORM_UPDATES'
  | 'TRADING_PSYCHOLOGY';

export interface PublicArticleListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: ArticleCategory;
  tags: string[] | null;
  featuredImageUrl: string | null;
  readingTimeMinutes: number;
  publishedAt: string;
}

export interface PublicArticleDetail extends PublicArticleListItem {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface PublicArticlePage {
  items: PublicArticleListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PublicArticleListFilter {
  page?: number;
  category?: ArticleCategory;
}

export interface PublicWeeklyRecapListItem {
  id: number;
  title: string;
  slug: string;
  weekStart: string;
  weekEnd: string;
  publishedAt: string;
  excerpt: string;
}

export interface PublicWeeklyRecapDetail {
  id: number;
  title: string;
  slug: string;
  weekStart: string;
  weekEnd: string;
  publishedAt: string;
  content: string;
}

export interface PublicWeeklyRecapPage {
  items: PublicWeeklyRecapListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PublicWeeklyRecapListFilter {
  page?: number;
}
