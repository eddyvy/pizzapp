import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserType } from '../user/types/user.types'
import { UserService } from '../user/user.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwt: JwtService) {}

  async login(loginDto: LoginDto): Promise<UserType | null> {
    const user = await this.userService.findByEmailAndPassword(
      loginDto.email,
      loginDto.password,
    )

    if (!user) return null

    return user
  }

  signToken(user: UserType): string {
    return this.jwt.sign({ user })
  }
}
