import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config'
import Redis from 'ioredis'
import redisConfig from 'src/config/redis.config'

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (
        configService: ConfigService,
      ) => {
        const host = configService.get<ConfigType<typeof redisConfig>['host']>('redis.host')
        const port = configService.get<ConfigType<typeof redisConfig>['port']>('redis.port')
        const client = new Redis({ host, port })

        const shutdown = async () => {
          await client.quit()
        }

        process.on('SIGINT', shutdown)
        process.on('SIGTERM', shutdown)

        return client
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
