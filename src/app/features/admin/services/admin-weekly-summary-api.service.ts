import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  WeeklySummaryDetail,
  WeeklySummaryListFilter,
  WeeklySummaryPage,
  WeeklySummarySaveRequest
} from '../models/weekly-summary.models';

@Injectable({ providedIn: 'root' })
export class AdminWeeklySummaryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  list(filter: WeeklySummaryListFilter = {}): Observable<WeeklySummaryPage> {
    let params = new HttpParams().set('page', filter.page ?? 1);
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    return this.http
      .get<ApiResponse<WeeklySummaryPage>>(`${this.baseUrl}/admin/weekly-summaries`, { params })
      .pipe(map((res) => res.data as WeeklySummaryPage));
  }

  detail(id: number): Observable<WeeklySummaryDetail> {
    return this.http
      .get<ApiResponse<WeeklySummaryDetail>>(`${this.baseUrl}/admin/weekly-summaries/${id}`)
      .pipe(map((res) => res.data as WeeklySummaryDetail));
  }

  save(id: number, body: WeeklySummarySaveRequest): Observable<WeeklySummaryDetail> {
    return this.http
      .put<ApiResponse<WeeklySummaryDetail>>(`${this.baseUrl}/admin/weekly-summaries/${id}`, body)
      .pipe(map((res) => res.data as WeeklySummaryDetail));
  }

  publish(id: number): Observable<WeeklySummaryDetail> {
    return this.http
      .post<ApiResponse<WeeklySummaryDetail>>(
        `${this.baseUrl}/admin/weekly-summaries/${id}/publish`,
        {}
      )
      .pipe(map((res) => res.data as WeeklySummaryDetail));
  }

  archive(id: number): Observable<WeeklySummaryDetail> {
    return this.http
      .post<ApiResponse<WeeklySummaryDetail>>(
        `${this.baseUrl}/admin/weekly-summaries/${id}/archive`,
        {}
      )
      .pipe(map((res) => res.data as WeeklySummaryDetail));
  }
}
