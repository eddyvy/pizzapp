import { UserRole } from '../enum/user-role.enum'

export class CreateUserDto {
  email: string
  name: string
  password: string
  role: UserRole
}
