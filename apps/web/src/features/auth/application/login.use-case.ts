import { IAuthRepository } from '../domain/auth.repository';
import { Credentials, LoginResponse } from '../domain/user';

export async function loginUseCase(
  authRepository: IAuthRepository,
  credentials: Credentials,
): Promise<LoginResponse> {
  if (!credentials.email || !credentials.password) {
    throw new Error('Debe completar el correo institucional y la contraseña');
  }

  return authRepository.login(credentials);
}
