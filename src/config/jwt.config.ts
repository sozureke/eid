import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModuleAsyncOptions } from '@nestjs/jwt'

export const jwtModuleOptions: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d') },
  }),
}