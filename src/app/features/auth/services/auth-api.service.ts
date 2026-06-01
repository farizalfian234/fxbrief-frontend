import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { AuthSessionStore } from '../../../core/auth/auth-session.store';
import {
  AuthSession,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest
} from '../models/auth.models';

interface RegisterResult {
  userId: number;
  email: string;
  message: string;
}

interface MessageResult {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly sessionStore = inject(AuthSessionStore);
  private readonly baseUrl = environment.apiUrl;

  login(payload: LoginRequest): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${this.baseUrl}/auth/login`, payload)
      .pipe(
        map((res) => res.data as AuthSession),
        tap((session) => this.sessionStore.setSession(session))
      );
  }

  loginWithGoogle(payload: GoogleLoginRequest): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${this.baseUrl}/auth/google`, payload)
      .pipe(
        map((res) => res.data as AuthSession),
        tap((session) => this.sessionStore.setSession(session))
      );
  }

  register(payload: RegisterRequest): Observable<RegisterResult> {
    return this.http
      .post<ApiResponse<RegisterResult>>(`${this.baseUrl}/auth/register`, payload)
      .pipe(map((res) => res.data as RegisterResult));
  }

  verifyEmail(payload: VerifyEmailRequest): Observable<MessageResult> {
    return this.http
      .post<ApiResponse<MessageResult>>(`${this.baseUrl}/auth/verify-email`, payload)
      .pipe(map((res) => res.data as MessageResult));
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<MessageResult> {
    return this.http
      .post<ApiResponse<MessageResult>>(`${this.baseUrl}/auth/forgot-password`, payload)
      .pipe(map((res) => res.data as MessageResult));
  }

  resetPassword(payload: ResetPasswordRequest): Observable<MessageResult> {
    return this.http
      .post<ApiResponse<MessageResult>>(`${this.baseUrl}/auth/reset-password`, payload)
      .pipe(map((res) => res.data as MessageResult));
  }

  logout(): void {
    this.sessionStore.clearAndRedirect();
  }
}
