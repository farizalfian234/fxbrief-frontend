import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  ArticleDetail,
  ArticleListFilter,
  ArticlePage,
  ArticleSaveRequest
} from '../models/article.models';

@Injectable({ providedIn: 'root' })
export class AdminArticleApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  list(filter: ArticleListFilter = {}): Observable<ArticlePage> {
    let params = new HttpParams().set('page', filter.page ?? 1);
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.category) {
      params = params.set('category', filter.category);
    }
    return this.http
      .get<ApiResponse<ArticlePage>>(`${this.baseUrl}/admin/articles`, { params })
      .pipe(map((res) => res.data as ArticlePage));
  }

  detail(id: number): Observable<ArticleDetail> {
    return this.http
      .get<ApiResponse<ArticleDetail>>(`${this.baseUrl}/admin/articles/${id}`)
      .pipe(map((res) => res.data as ArticleDetail));
  }

  create(body: ArticleSaveRequest): Observable<ArticleDetail> {
    return this.http
      .post<ApiResponse<ArticleDetail>>(`${this.baseUrl}/admin/articles`, body)
      .pipe(map((res) => res.data as ArticleDetail));
  }

  update(id: number, body: Partial<ArticleSaveRequest>): Observable<ArticleDetail> {
    return this.http
      .put<ApiResponse<ArticleDetail>>(`${this.baseUrl}/admin/articles/${id}`, body)
      .pipe(map((res) => res.data as ArticleDetail));
  }

  publish(id: number): Observable<ArticleDetail> {
    return this.http
      .post<ApiResponse<ArticleDetail>>(`${this.baseUrl}/admin/articles/${id}/publish`, {})
      .pipe(map((res) => res.data as ArticleDetail));
  }

  archive(id: number): Observable<ArticleDetail> {
    return this.http
      .post<ApiResponse<ArticleDetail>>(`${this.baseUrl}/admin/articles/${id}/archive`, {})
      .pipe(map((res) => res.data as ArticleDetail));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.baseUrl}/admin/articles/${id}`)
      .pipe(map(() => undefined));
  }
}
