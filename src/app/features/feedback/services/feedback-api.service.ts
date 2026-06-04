import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { FeedbackRequest, FeedbackResult } from '../models/feedback.models';

@Injectable({ providedIn: 'root' })
export class FeedbackApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  submit(payload: FeedbackRequest): Observable<FeedbackResult> {
    return this.http
      .post<ApiResponse<FeedbackResult>>(`${this.baseUrl}/feedback`, payload)
      .pipe(map((res) => res.data as FeedbackResult));
  }
}
