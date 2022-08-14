import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { UserModule } from '../user/user.module'
import { JwtStrategy } from './strategy/jwt.strategy'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        privateKey: config.get('PRIVATE_KEY'),
        publicKey: config.get('PUBLIC_KEY'),
        signOptions: { expiresIn: '10m', algorithm: 'RS256' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
