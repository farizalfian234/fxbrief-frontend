import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  ExchangeRate,
  Subscription,
  TopUpInitiation,
  TopUpRequest
} from '../models/subscription.models';

@Injectable({ providedIn: 'root' })
export class SubscriptionApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get(): Observable<Subscription> {
    return this.http
      .get<ApiResponse<Subscription>>(`${this.baseUrl}/subscription`)
      .pipe(map((res) => res.data as Subscription));
  }

  /**
   * Initiates a top-up. Returns the Snap token and carry-over preview. Does not
   * change the subscription — the plan/report mutation happens on Midtrans
   * webhook confirmation. The backend decides sandbox vs production and beta
   * eligibility; the frontend acts on the response only.
   */
  topUp(payload: TopUpRequest): Observable<TopUpInitiation> {
    return this.http
      .post<ApiResponse<TopUpInitiation>>(`${this.baseUrl}/subscription/top-up`, payload)
      .pipe(map((res) => res.data as TopUpInitiation));
  }

  exchangeRate(): Observable<ExchangeRate> {
    return this.http
      .get<ApiResponse<ExchangeRate>>(`${this.baseUrl}/api/exchange-rate`)
      .pipe(map((res) => res.data as ExchangeRate));
  }
}
