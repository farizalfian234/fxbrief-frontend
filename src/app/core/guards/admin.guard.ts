import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { AuthSessionStore } from '../auth/auth-session.store';
import { APP_ROUTES } from '../config/app-routes';

const requireAdmin = (): boolean | ReturnType<Router['createUrlTree']> => {
  const sessionStore = inject(AuthSessionStore);
  const router = inject(Router);

  if (!sessionStore.isAuthenticated()) {
    return router.createUrlTree([APP_ROUTES.login]);
  }
  if (sessionStore.isAdmin()) {
    return true;
  }
  return router.createUrlTree([APP_ROUTES.dashboard]);
};

export const adminGuard: CanActivateFn = () => requireAdmin();
export const adminChildGuard: CanActivateChildFn = () => requireAdmin();
