import { IAuthRepository } from '../domain/auth.repository';
import { Credentials, LoginResponse, AuthUser } from '../domain/user';
import { apiClient } from '../../../core/http/apiClient';

export class HttpAuthRepository implements IAuthRepository {
  async login(credentials: Credentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials,
    );
    return response.data;
  }

  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>('/auth/me');
    return response.data;
  }
}
