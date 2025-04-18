import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'

import redisConfig from './config/redis.config'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig]
    }),
    ThrottlerModule.forRoot({throttlers: [{
      ttl: 6000,
      limit: 10,
    }]}),
    AuthModule,
    PrismaModule,
    RedisModule
  ],
  controllers: [],
  providers: [{provide: 'APP_GUARD', useClass: ThrottlerModule }],
})
export class AppModule {}
