import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator'
import { UserRole } from '../enum/user-role.enum'

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  password: string

  @IsEnum(UserRole)
  role: UserRole
}
