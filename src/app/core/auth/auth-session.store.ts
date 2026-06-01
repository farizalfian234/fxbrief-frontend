import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { APP_ROUTES } from '../config/app-routes';
import { AuthSession, UserRole } from '../../features/auth/models/auth.models';

/**
 * Single source of truth for the authenticated session. Guards, the interceptor
 * and layouts read from here. HTTP calls that establish a session live in the
 * auth feature's AuthApiService and call setSession on success.
 */
@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<AuthSession | null>(this.tokenStorage.get());

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly role = computed<UserRole | null>(() => this.sessionSignal()?.role ?? null);
  readonly isAdmin = computed(() => this.sessionSignal()?.role === 'ADMIN');
  readonly displayName = computed(() => this.sessionSignal()?.name ?? '');

  setSession(session: AuthSession): void {
    this.tokenStorage.set(session);
    this.sessionSignal.set(session);
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  /**
   * Clears the session and returns to login. Used by explicit logout and by the
   * interceptor on a 401. No backend call is made — v1 has no server-side
   * session to invalidate.
   */
  clearAndRedirect(): void {
    this.tokenStorage.clear();
    this.sessionSignal.set(null);
    void this.router.navigateByUrl(APP_ROUTES.login);
  }

  clear(): void {
    this.tokenStorage.clear();
    this.sessionSignal.set(null);
  }
}
