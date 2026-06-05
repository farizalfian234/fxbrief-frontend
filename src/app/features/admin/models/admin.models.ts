export type PlanCode = 'FREE' | 'BASIC' | 'PREMIUM';
export type TopUpPlan = 'BASIC' | 'PREMIUM';

export interface DashboardStats {
  totalActiveSubscribers: number;
  totalReportsCurrentForexMonth: number;
  totalFreeUsersActive: number;
  usersAtZeroRemainingReports: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface NewSubscribersPoint {
  month: string;
  count: number;
}

export interface ActiveInactiveSplit {
  active: number;
  inactive: number;
}

export interface ReportVolumePoint {
  forexMarketDate: string;
  count: number;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  plan: PlanCode;
  remainingReports: number;
  active: boolean;
  hasEverPaid: boolean;
  deletionRequestedAt: string | null;
  lastGeneratedAt: string | null;
}

export interface AdminUserPage {
  items: AdminUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TopUpResult {
  userId: number;
  plan: PlanCode;
  remainingReports: number;
  hasEverPaid: boolean;
  planChanged: boolean;
}

export interface ActivationResult {
  userId: number;
  active: boolean;
}

export interface UsageRow {
  reportId: number;
  userId: number;
  userEmail: string;
  userName: string;
  forexMarketDate: string;
  planAtGeneration: PlanCode;
  countedAgainstLimit: boolean;
  generatedAt: string;
}

export interface UsagePage {
  items: UsageRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UsageFilter {
  page?: number;
  from?: string;
  to?: string;
  user?: string;
}

export interface FeedbackRow {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  content: string;
  submittedAt: string;
  replied: boolean;
  repliedAt?: string;
  replyContent?: string;
}

export interface FeedbackPage {
  items: FeedbackRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FeedbackReplyResult {
  id: number;
  replied: boolean;
  repliedAt: string;
  replyContent: string;
}
