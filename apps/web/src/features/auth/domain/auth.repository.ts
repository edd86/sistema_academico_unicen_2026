import { Credentials, LoginResponse, AuthUser } from './user';

export interface IAuthRepository {
  login(credentials: Credentials): Promise<LoginResponse>;
  getMe(): Promise<AuthUser>;
}
