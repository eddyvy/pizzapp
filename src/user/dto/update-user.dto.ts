import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'
import { UserRole } from '../enum/user-role.enum'

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email: string

  @IsString()
  @IsOptional()
  name: string

  @IsString()
  @IsOptional()
  password: string

  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole
}
