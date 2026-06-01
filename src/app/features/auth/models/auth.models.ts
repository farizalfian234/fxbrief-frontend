export type UserRole = 'USER' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface AuthSession {
  token: string;
  tokenType: string;
  expiresAt: string;
  userId: number;
  email: string;
  name: string;
  role: UserRole;
  deletionPending: boolean;
  deletionDate?: string;
}
