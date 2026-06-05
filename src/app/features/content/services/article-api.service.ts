import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  ArticleCategory,
  PublicArticleDetail,
  PublicArticleListFilter,
  PublicArticlePage
} from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class ArticleApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  list(filter: PublicArticleListFilter = {}): Observable<PublicArticlePage> {
    let params = new HttpParams().set('page', filter.page ?? 1);
    if (filter.category) {
      params = params.set('category', filter.category);
    }
    return this.http
      .get<ApiResponse<PublicArticlePage>>(`${this.baseUrl}/public/articles`, { params })
      .pipe(map((res) => res.data as PublicArticlePage));
  }

  categories(): Observable<ArticleCategory[]> {
    return this.http
      .get<ApiResponse<ArticleCategory[]>>(`${this.baseUrl}/public/articles/categories`)
      .pipe(map((res) => (res.data as ArticleCategory[]) ?? []));
  }

  detail(slug: string): Observable<PublicArticleDetail> {
    return this.http
      .get<ApiResponse<PublicArticleDetail>>(
        `${this.baseUrl}/public/articles/${encodeURIComponent(slug)}`
      )
      .pipe(map((res) => res.data as PublicArticleDetail));
  }
}
