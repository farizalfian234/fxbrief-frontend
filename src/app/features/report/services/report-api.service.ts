import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  GenerateRequest,
  HistoryPage,
  ReportResponse
} from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class ReportApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Generates today's report. An optional one-time preference override is sent
   * in the body; when omitted the user's saved preference (if any) applies.
   */
  generate(override?: GenerateRequest): Observable<ReportResponse> {
    const body = override?.preferenceType && override?.preferenceValue ? override : {};
    return this.http
      .post<ApiResponse<ReportResponse>>(`${this.baseUrl}/reports/generate`, body)
      .pipe(map((res) => res.data as ReportResponse));
  }

  /**
   * Returns today's report if one exists. The backend omits `data` when nothing
   * has been generated yet today, which surfaces here as null.
   */
  today(): Observable<ReportResponse | null> {
    return this.http
      .get<ApiResponse<ReportResponse>>(`${this.baseUrl}/reports/today`)
      .pipe(map((res) => res.data ?? null));
  }

  history(page = 1): Observable<HistoryPage> {
    const params = new HttpParams().set('page', page);
    return this.http
      .get<ApiResponse<HistoryPage>>(`${this.baseUrl}/reports/history`, { params })
      .pipe(map((res) => res.data as HistoryPage));
  }

  historyDetail(reportId: number): Observable<ReportResponse> {
    return this.http
      .get<ApiResponse<ReportResponse>>(`${this.baseUrl}/reports/history/${reportId}`)
      .pipe(map((res) => res.data as ReportResponse));
  }
}
