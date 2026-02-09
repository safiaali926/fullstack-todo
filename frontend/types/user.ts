/**
 * User type definitions
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface AuthResponse {
  user: User;
  session: AuthSession;
}
