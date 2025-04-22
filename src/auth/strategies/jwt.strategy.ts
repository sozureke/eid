import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { JwtPayload } from 'jsonwebtoken'
import { ExtractJwt, Strategy } from 'passport-jwt'
import jwtConfig from 'src/config/jwt.config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.secret
    })
  }

  async validate(payload: JwtPayload): Promise<{ userId: string }> {
    return { userId: payload.sub }
  }
}
