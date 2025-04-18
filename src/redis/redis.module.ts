import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisConfig } from '../config/redis.config'

@Global()
@Module({
  imports: [ConfigModule.forRoot({ load: [() => ({})] }), ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const Redis = (await import('ioredis')).default
        return new Redis(redisConfig())
      },
      inject: [ConfigService]
    }
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
