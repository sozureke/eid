import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'

import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard'
import { RolesGuard } from './auth/guard/roles.guard'
import { OwnershipGuard } from './common/guards/ownership.guard'
import nlpConfig from './config/nlp.config'
import ollamaConfig from './config/ollama.config'
import redisConfig from './config/redis.config'
import { NlpModule } from './nlp/nlp.module'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { ThoughtsModule } from './thoughts/thoughts.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, nlpConfig, ollamaConfig],
    }),
    ThrottlerModule.forRoot({throttlers: [{
      ttl: 6000,
      limit: 10,
    }]}),
    AuthModule,
    PrismaModule,
    RedisModule,
    ThoughtsModule,
    NlpModule
  ],
  controllers: [],
  providers: [{provide: 'APP_GUARD', useClass: ThrottlerModule },     { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: OwnershipGuard },],
})
export class AppModule {}
