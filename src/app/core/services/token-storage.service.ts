import { Injectable } from '@angular/core';
import { AuthSession } from '../../features/auth/models/auth.models';

/**
 * Holds the active session in memory only. The token is never written to
 * localStorage or cookies, so it cannot be read by injected scripts and is
 * cleared on tab close. A reload therefore requires re-authentication, which is
 * acceptable for v1 (24h tokens, no refresh flow).
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private session: AuthSession | null = null;

  set(session: AuthSession): void {
    this.session = session;
  }

  get(): AuthSession | null {
    return this.session;
  }

  getToken(): string | null {
    return this.session?.token ?? null;
  }

  clear(): void {
    this.session = null;
  }
}
