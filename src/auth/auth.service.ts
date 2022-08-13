import { Injectable } from '@nestjs/common'
import { GetUserDto } from 'src/user/dto'
import { UserService } from 'src/user/user.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async login(loginDto: LoginDto): Promise<GetUserDto | null> {
    const user = await this.userService.findByEmailAndPassword(
      loginDto.email,
      loginDto.password,
    )

    if (!user) return null

    return user
  }
}
