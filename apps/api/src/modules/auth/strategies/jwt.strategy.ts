import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { ITokenStrategy, TokenPayload } from './token.strategy.interface';
import { UsersRepository } from '../../users/users.repository';

@Injectable()
export class JwtTokenStrategy
  extends PassportStrategy(Strategy)
  implements ITokenStrategy
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'unicen_super_secret_jwt_key_2026_academic_precision',
    });
  }

  async sign(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret:
        process.env.JWT_SECRET ||
        'unicen_super_secret_jwt_key_2026_academic_precision',
      expiresIn: (process.env.JWT_EXPIRATION as any) || '24h',
    });
  }

  async verify(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret:
        process.env.JWT_SECRET ||
        'unicen_super_secret_jwt_key_2026_academic_precision',
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.usersRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token inválido: Usuario no encontrado');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      student: user.student,
    };
  }
}
