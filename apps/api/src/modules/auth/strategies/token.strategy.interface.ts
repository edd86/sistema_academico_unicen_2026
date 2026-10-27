import { UserRole } from '@unicen/shared';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export const TOKEN_STRATEGY = 'TOKEN_STRATEGY';

export interface ITokenStrategy {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
