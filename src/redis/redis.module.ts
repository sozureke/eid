import { Global, Inject, Injectable, Module, OnApplicationShutdown } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import Redis, { Redis as RedisClient } from 'ioredis'
import redisConfig from '../config/redis.config'

@Injectable()
class RedisShutdownService implements OnApplicationShutdown {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: RedisClient) {}

  async onApplicationShutdown(signal: string) {
    await this.redis.quit()
    console.log(`[Redis] Connection closed on ${signal}`)
  }
}

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigType<typeof redisConfig>) => {
        return new Redis({
          host: config.host,
          port: config.port,
        })
      },
      inject: [redisConfig.KEY],
    },
    RedisShutdownService,
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
