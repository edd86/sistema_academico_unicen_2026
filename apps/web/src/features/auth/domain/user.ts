import { UserRole } from '@unicen/shared';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
  student?: {
    id: string;
    ru: string;
    career: string;
  };
}

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
