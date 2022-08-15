import { CreateUserDto } from '../../src/user/dto'
import { UserRole } from '../../src/user/enum/user-role.enum'

export const adminUser: CreateUserDto = {
  email: 'test@admin.test',
  name: 'testName',
  password: 'testPass',
  role: UserRole.ADMIN,
}

export const notAdminUser: CreateUserDto = {
  email: 'test@user.test',
  name: 'testNameUser',
  password: 'testPass',
  role: UserRole.USER,
}
