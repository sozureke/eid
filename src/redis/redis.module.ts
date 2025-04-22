import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config'
import Redis from 'ioredis'
import redisConfig from 'src/config/redis.config'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigType<typeof redisConfig>) => {
        const host = config.host
        const port = config.port
        return new Redis({ host, port })
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
