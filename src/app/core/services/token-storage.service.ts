import { Injectable } from '@angular/core';
import { AuthSession } from '../../features/auth/models/auth.models';

const STORAGE_KEY = 'fx.session';

/**
 * Holds the active session for the lifetime of the browser tab. The session is
 * kept in a private field for synchronous access and mirrored into
 * sessionStorage so a page reload within the same tab restores it without a
 * re-login. sessionStorage (not localStorage) is used deliberately: it is
 * scoped to the tab and cleared on tab close, and it is never shared across
 * origins. The token is not written to cookies.
 *
 * sessionStorage does not extend token lifetime — an expired token still yields
 * a 401 on the next call, which the interceptor turns into a logout. Reads from
 * storage are guarded so the service is safe during the prerender/server pass
 * where sessionStorage is undefined.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private session: AuthSession | null = this.readFromStorage();

  set(session: AuthSession): void {
    this.session = session;
    this.writeToStorage(session);
  }

  get(): AuthSession | null {
    return this.session;
  }

  getToken(): string | null {
    return this.session?.token ?? null;
  }

  clear(): void {
    this.session = null;
    this.removeFromStorage();
  }

  private readFromStorage(): AuthSession | null {
    const store = this.storage();
    if (!store) {
      return null;
    }
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      store.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private writeToStorage(session: AuthSession): void {
    this.storage()?.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private removeFromStorage(): void {
    this.storage()?.removeItem(STORAGE_KEY);
  }

  private storage(): Storage | null {
    return typeof window !== 'undefined' && window.sessionStorage
      ? window.sessionStorage
      : null;
  }
}
