import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  PreferenceOptions,
  SavePreferenceRequest,
  UserPreference
} from '../models/preferences.models';

@Injectable({ providedIn: 'root' })
export class PreferencesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get(): Observable<UserPreference> {
    return this.http
      .get<ApiResponse<UserPreference>>(`${this.baseUrl}/user/preferences`)
      .pipe(map((res) => res.data as UserPreference));
  }

  options(): Observable<PreferenceOptions> {
    return this.http
      .get<ApiResponse<PreferenceOptions>>(`${this.baseUrl}/user/preferences/options`)
      .pipe(map((res) => res.data as PreferenceOptions));
  }

  save(payload: SavePreferenceRequest): Observable<UserPreference> {
    return this.http
      .put<ApiResponse<UserPreference>>(`${this.baseUrl}/user/preferences`, payload)
      .pipe(map((res) => res.data as UserPreference));
  }

  clear(): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.baseUrl}/user/preferences`)
      .pipe(map(() => undefined));
  }
}
