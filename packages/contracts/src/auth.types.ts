export type AccountStatus = 'ACTIVE' | 'GUEST' | 'SUSPENDED' | 'DELETED';

export interface JwtPayload {
  sub: string;
  email: string;
  status: AccountStatus;
  locale: string;
  sessionId: string;
  familyId: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  accountId: string;
  email: string;
  status: AccountStatus;
}

export interface MeResponse {
  id: string;
  email: string;
  status: AccountStatus;
  locale: string;
  createdAt: string;
}

export interface DeleteAccountResponse {
  deletedAt: string;
}
