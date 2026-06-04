import { Routes } from '@angular/router';

/**
 * Public information and error pages rendered under the adaptive InfoLayout —
 * authenticated users keep the app chrome, logged-out visitors get the
 * marketing chrome. Landing is intentionally not here; it stays marketing-only
 * under the public layout.
 */
export const INFO_ROUTES: Routes = [
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy.component').then((m) => m.PrivacyComponent)
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms.component').then((m) => m.TermsComponent)
  },
  {
    path: 'support',
    loadComponent: () => import('./pages/support/support.component').then((m) => m.SupportComponent)
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent)
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./pages/server-error/server-error.component').then((m) => m.ServerErrorComponent)
  }
];
