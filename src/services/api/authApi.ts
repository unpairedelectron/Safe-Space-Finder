import { httpClient } from './httpClient';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>('/auth/login', { email, password });
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>('/auth/register', { name, email, password });
}

export async function logoutApi() {
  try { await httpClient.post('/auth/logout', {}); } catch { /* ignore */ }
}

export async function refreshTokens(refreshToken: string) {
  return httpClient.post<{ accessToken: string; refreshToken?: string; expiresIn: number }>('/auth/refresh', { refreshToken });
}
