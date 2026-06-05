import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  ActivationResult,
  ActiveInactiveSplit,
  AdminUserPage,
  DashboardStats,
  FeedbackPage,
  FeedbackReplyResult,
  NewSubscribersPoint,
  ReportVolumePoint,
  RevenuePoint,
  TopUpPlan,
  TopUpResult,
  UsageFilter,
  UsagePage
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  dashboardStats(): Observable<DashboardStats> {
    return this.http
      .get<ApiResponse<DashboardStats>>(`${this.baseUrl}/admin/dashboard/stats`)
      .pipe(map((res) => res.data as DashboardStats));
  }

  revenue(): Observable<RevenuePoint[]> {
    return this.http
      .get<ApiResponse<RevenuePoint[]>>(`${this.baseUrl}/admin/dashboard/revenue`)
      .pipe(map((res) => res.data ?? []));
  }

  newSubscribers(): Observable<NewSubscribersPoint[]> {
    return this.http
      .get<ApiResponse<NewSubscribersPoint[]>>(`${this.baseUrl}/admin/dashboard/new-subscribers`)
      .pipe(map((res) => res.data ?? []));
  }

  activeInactive(): Observable<ActiveInactiveSplit> {
    return this.http
      .get<ApiResponse<ActiveInactiveSplit>>(`${this.baseUrl}/admin/dashboard/active-inactive`)
      .pipe(map((res) => res.data as ActiveInactiveSplit));
  }

  reportVolume(): Observable<ReportVolumePoint[]> {
    return this.http
      .get<ApiResponse<ReportVolumePoint[]>>(`${this.baseUrl}/admin/dashboard/report-volume`)
      .pipe(map((res) => res.data ?? []));
  }

  users(page = 1): Observable<AdminUserPage> {
    const params = new HttpParams().set('page', page);
    return this.http
      .get<ApiResponse<AdminUserPage>>(`${this.baseUrl}/admin/users`, { params })
      .pipe(map((res) => res.data as AdminUserPage));
  }

  topUp(userId: number, plan: TopUpPlan): Observable<TopUpResult> {
    return this.http
      .post<ApiResponse<TopUpResult>>(`${this.baseUrl}/admin/users/${userId}/top-up`, { plan })
      .pipe(map((res) => res.data as TopUpResult));
  }

  activate(userId: number): Observable<ActivationResult> {
    return this.http
      .post<ApiResponse<ActivationResult>>(`${this.baseUrl}/admin/users/${userId}/activate`, {})
      .pipe(map((res) => res.data as ActivationResult));
  }

  deactivate(userId: number): Observable<ActivationResult> {
    return this.http
      .post<ApiResponse<ActivationResult>>(`${this.baseUrl}/admin/users/${userId}/deactivate`, {})
      .pipe(map((res) => res.data as ActivationResult));
  }

  usage(filter: UsageFilter = {}): Observable<UsagePage> {
    let params = new HttpParams().set('page', filter.page ?? 1);
    if (filter.from) {
      params = params.set('from', filter.from);
    }
    if (filter.to) {
      params = params.set('to', filter.to);
    }
    if (filter.user && filter.user.trim()) {
      params = params.set('user', filter.user.trim());
    }
    return this.http
      .get<ApiResponse<UsagePage>>(`${this.baseUrl}/admin/usage`, { params })
      .pipe(map((res) => res.data as UsagePage));
  }

  feedback(page = 1): Observable<FeedbackPage> {
    const params = new HttpParams().set('page', page);
    return this.http
      .get<ApiResponse<FeedbackPage>>(`${this.baseUrl}/admin/feedback`, { params })
      .pipe(map((res) => res.data as FeedbackPage));
  }

  replyFeedback(feedbackId: number, replyContent: string): Observable<FeedbackReplyResult> {
    return this.http
      .post<ApiResponse<FeedbackReplyResult>>(
        `${this.baseUrl}/admin/feedback/${feedbackId}/reply`,
        { replyContent }
      )
      .pipe(map((res) => res.data as FeedbackReplyResult));
  }
}
