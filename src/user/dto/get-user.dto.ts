import { UserRole } from '../enum/user-role.enum'

export class GetUserDto {
  id: string
  name: string
  email: string
  role: UserRole
}
