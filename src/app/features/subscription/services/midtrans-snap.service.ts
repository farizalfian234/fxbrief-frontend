import { Injectable } from '@angular/core';

interface SnapCallbacks {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
}

interface SnapPayOptions extends SnapCallbacks {
  language?: string;
}

interface SnapApi {
  pay(token: string, options: SnapPayOptions): void;
}

declare global {
  interface Window {
    snap?: SnapApi;
  }
}

const SANDBOX_SNAP = 'https://app.sandbox.midtrans.com/snap/snap.js';
const PRODUCTION_SNAP = 'https://app.midtrans.com/snap/snap.js';

/**
 * Loads the Midtrans Snap script on demand and opens the Snap popup. The script
 * URL is chosen from the backend-provided `production` flag — false loads the
 * sandbox script, true loads production. A token minted in one environment
 * cannot be opened by the other, so the flag (not the client key, not a
 * hardcoded URL) is the single source of truth for which script to load. This
 * keeps the frontend environment-agnostic: switching sandbox/production is a
 * backend concern only.
 *
 * The script is loaded lazily (never during prerender, never until a top-up is
 * actually initiated) and only reloaded when the environment changes.
 */
@Injectable({ providedIn: 'root' })
export class MidtransSnapService {
  private loadedSrc: string | null = null;
  private loadPromise: Promise<void> | null = null;

  private async ensureLoaded(production: boolean): Promise<void> {
    if (typeof document === 'undefined') {
      throw new Error('Snap is only available in the browser.');
    }
    const src = production ? PRODUCTION_SNAP : SANDBOX_SNAP;
    if (this.loadedSrc === src && window.snap) {
      return;
    }
    if (this.loadPromise && this.loadedSrc === src) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      // Remove any prior Snap script so a different environment loads cleanly.
      document
        .querySelectorAll('script[data-fx-snap]')
        .forEach((el) => el.parentNode?.removeChild(el));

      const script = document.createElement('script');
      script.src = src;
      script.setAttribute('data-fx-snap', '');
      script.async = true;
      script.onload = () => {
        this.loadedSrc = src;
        resolve();
      };
      script.onerror = () => {
        this.loadPromise = null;
        reject(new Error('Failed to load the payment module.'));
      };
      document.head.appendChild(script);
    });
    return this.loadPromise;
  }

  /**
   * Opens the Snap payment popup for the given token in the environment named by
   * `production`. Resolves on a successful or pending payment, rejects on error,
   * and resolves to 'closed' when the user dismisses the popup without paying.
   */
  async pay(
    snapToken: string,
    production: boolean
  ): Promise<'success' | 'pending' | 'closed'> {
    await this.ensureLoaded(production);
    const snap = window.snap;
    if (!snap) {
      throw new Error('Payment module is unavailable.');
    }

    return new Promise<'success' | 'pending' | 'closed'>((resolve, reject) => {
      let settled = false;
      const finish = (value: 'success' | 'pending' | 'closed') => {
        if (!settled) {
          settled = true;
          resolve(value);
        }
      };
      snap.pay(snapToken, {
        language: 'en',
        onSuccess: () => finish('success'),
        onPending: () => finish('pending'),
        onClose: () => finish('closed'),
        onError: (result) => {
          if (!settled) {
            settled = true;
            reject(result instanceof Error ? result : new Error('Payment failed.'));
          }
        }
      });
    });
  }
}
