import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-response.model';

/** Extracts the typed ApiError envelope from a failed HTTP response, if present. */
export function apiErrorOf(err: unknown): ApiError | null {
  if (err instanceof HttpErrorResponse && err.error && typeof err.error === 'object') {
    const body = err.error as { error?: ApiError };
    return body.error ?? null;
  }
  return null;
}

/** The error code from a failed HTTP response, or null when none is present. */
export function errorCodeOf(err: unknown): string | null {
  return apiErrorOf(err)?.code ?? null;
}

/**
 * Resolves a user-facing message for a failed request. A caller may pass a map
 * of code → message to override the defaults for a given screen; anything not
 * mapped falls back to the generic table below, then to the server message,
 * then to a safe default. Network failures (status 0) get their own message.
 */
export function messageForError(
  err: unknown,
  overrides: Record<string, string> = {}
): string {
  if (err instanceof HttpErrorResponse && err.status === 0) {
    return 'Could not reach the server. Check your connection and try again.';
  }

  const apiError = apiErrorOf(err);
  const code = apiError?.code;

  if (code && overrides[code]) {
    return overrides[code];
  }
  if (code && DEFAULT_MESSAGES[code]) {
    return DEFAULT_MESSAGES[code];
  }
  if (apiError?.message) {
    return apiError.message;
  }
  return 'Something went wrong. Please try again.';
}

const DEFAULT_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: 'Please check the form and try again.',
  MALFORMED_REQUEST: 'The request could not be processed. Please try again.',
  EMAIL_DOMAIN_NOT_ALLOWED:
    'That email domain is not allowed. Please use a different email address.',
  INVALID_TOKEN: 'This link is invalid. Please request a new one.',
  TOKEN_EXPIRED: 'This link has expired. Please request a new one.',
  TOKEN_ALREADY_USED: 'This link has already been used. Please request a new one.',
  INVALID_GOOGLE_TOKEN: 'Google sign-in could not be completed. Please try again.',
  UNAUTHENTICATED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect.',
  ACCOUNT_NOT_VERIFIED:
    'Your email is not verified yet. Please check your inbox for the verification link.',
  ACCOUNT_INACTIVE: 'This account is not active. Please contact support.',
  EMAIL_ALREADY_REGISTERED: 'An account with this email already exists.',
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a moment and try again.'
};
