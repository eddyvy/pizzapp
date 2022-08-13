import { UserType } from 'src/user/types/user.types'

export type JwtPayloadType = {
  exp: number
  iat: number
  user: UserType
}
