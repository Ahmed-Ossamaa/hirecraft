import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type ConfigType } from '@nestjs/config';
import jwtConfig from '../../../config/jwt.config';
import { JwtPayload } from '@/common/types/jwt.types';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          if (req && req.cookies) {
            const token = (req.cookies as Record<string, unknown>)[
              'access_token'
            ];
            return typeof token === 'string' ? token : null;
          }
          return null;
        },
      ]),
      ignoreExpiration: false, // Rejects expired tokens
      secretOrKey: config.accessSecret,
    });
  }

  validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.sub,
      email: payload.email,
      userType: payload.userType,
      companyId: payload.companyId,
      role: payload.role,
    };
  }
}
