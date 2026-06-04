import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  prompt(): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Thin wrapper over Google Identity Services. The GIS script is loaded on
 * demand the first time a sign-in is requested, so it never runs during the
 * prerender pass and never loads when Google sign-in is not configured.
 *
 * When environment.googleOAuthClientId is empty the service reports itself as
 * unavailable; callers render the Google button disabled rather than failing at
 * runtime. Providing the client id in the environment files is the only change
 * needed to switch the flow on.
 */
@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private scriptPromise: Promise<void> | null = null;

  get available(): boolean {
    return (
      typeof window !== 'undefined' && environment.googleOAuthClientId.trim().length > 0
    );
  }

  /**
   * Triggers the Google account chooser and resolves with the returned ID token.
   * Rejects if Google sign-in is not configured or the script cannot load.
   */
  async requestIdToken(): Promise<string> {
    if (!this.available) {
      throw new Error('Google sign-in is not configured.');
    }

    await this.loadScript();
    const id = window.google?.accounts?.id;
    if (!id) {
      throw new Error('Google Identity Services failed to load.');
    }

    return new Promise<string>((resolve) => {
      id.initialize({
        client_id: environment.googleOAuthClientId,
        callback: (response) => resolve(response.credential)
      });
      id.prompt();
    });
  }

  private loadScript(): Promise<void> {
    if (this.scriptPromise) {
      return this.scriptPromise;
    }
    this.scriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
      document.head.appendChild(script);
    });
    return this.scriptPromise;
  }
}
