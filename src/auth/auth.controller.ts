import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.login(loginDto)

    if (!user) throw new UnauthorizedException('Invalid email or password')

    const token = this.authService.signToken(user)

    return { token }
  }
}
