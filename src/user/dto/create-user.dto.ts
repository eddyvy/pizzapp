import { IsEmail, IsNotEmpty, IsEnum, IsString } from 'class-validator'
import { UserRole } from '../enum/user-role.enum'

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsEnum(UserRole)
  role: UserRole
}
