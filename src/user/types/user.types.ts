import { UserRole } from '../enum/user-role.enum'

export type UserType = {
  id: string
  name: string
  email: string
  role: UserRole
}
