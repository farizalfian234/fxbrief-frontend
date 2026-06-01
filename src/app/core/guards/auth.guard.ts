import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { AuthSessionStore } from '../auth/auth-session.store';
import { APP_ROUTES } from '../config/app-routes';

const requireAuth = (): boolean | ReturnType<Router['createUrlTree']> => {
  const sessionStore = inject(AuthSessionStore);
  const router = inject(Router);

  if (sessionStore.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree([APP_ROUTES.login]);
};

export const authGuard: CanActivateFn = () => requireAuth();
export const authChildGuard: CanActivateChildFn = () => requireAuth();
