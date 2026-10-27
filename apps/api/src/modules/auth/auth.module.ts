import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtTokenStrategy } from './strategies/jwt.strategy';
import { TOKEN_STRATEGY } from './strategies/token.strategy.interface';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'unicen_super_secret_jwt_key_2026_academic_precision',
      signOptions: { expiresIn: (process.env.JWT_EXPIRATION as any) || '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenStrategy,
    {
      provide: TOKEN_STRATEGY,
      useExisting: JwtTokenStrategy,
    },
  ],
  exports: [AuthService, JwtTokenStrategy, TOKEN_STRATEGY, PassportModule],
})
export class AuthModule {}
