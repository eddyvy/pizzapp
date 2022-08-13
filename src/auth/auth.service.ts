import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  login() {
    return { success: true, msg: 'Logged In!!' }
  }
}
