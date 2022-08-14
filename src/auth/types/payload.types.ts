import { UserType } from '../../user/types/user.types'

export type JwtPayloadType = {
  exp: number
  iat: number
  user: UserType
}
