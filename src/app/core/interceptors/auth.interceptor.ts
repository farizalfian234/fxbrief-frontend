import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthSessionStore } from '../auth/auth-session.store';

/**
 * Attaches the bearer token to every outgoing request that has one available
 * and converts a 401 into a forced logout + redirect to login. The Authorization
 * header is only added when a token exists, so unauthenticated public calls are
 * left untouched.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStore = inject(AuthSessionStore);
  const token = sessionStore.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        sessionStore.clearAndRedirect();
      }
      return throwError(() => error);
    })
  );
};
