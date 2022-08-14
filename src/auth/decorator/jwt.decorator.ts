import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtPayloadType } from '../types/jwt.types'

export const JwtPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as JwtPayloadType
  },
)
