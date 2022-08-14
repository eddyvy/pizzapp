import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayloadType } from '../types/jwt.types'
import { UserService } from '../../user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('PUBLIC_KEY'),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: JwtPayloadType): Promise<JwtPayloadType> {
    const user = await this.userService.findOne(payload.id)

    return user ? payload : null
  }
}
