import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  PublicWeeklyRecapDetail,
  PublicWeeklyRecapListFilter,
  PublicWeeklyRecapPage
} from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class WeeklyRecapApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  list(filter: PublicWeeklyRecapListFilter = {}): Observable<PublicWeeklyRecapPage> {
    const params = new HttpParams().set('page', filter.page ?? 1);
    return this.http
      .get<ApiResponse<PublicWeeklyRecapPage>>(`${this.baseUrl}/public/weekly-summaries`, {
        params
      })
      .pipe(map((res) => res.data as PublicWeeklyRecapPage));
  }

  detail(slug: string): Observable<PublicWeeklyRecapDetail> {
    return this.http
      .get<ApiResponse<PublicWeeklyRecapDetail>>(
        `${this.baseUrl}/public/weekly-summaries/${encodeURIComponent(slug)}`
      )
      .pipe(map((res) => res.data as PublicWeeklyRecapDetail));
  }
}
