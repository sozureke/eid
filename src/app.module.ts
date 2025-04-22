import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'

import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard'
import { RolesGuard } from './auth/guard/roles.guard'
import { OwnershipGuard } from './common/guards/ownership.guard'
import appConfig, { appConfigSchema } from './config/app.config'
import jwtConfig, { jwtConfigSchema } from './config/jwt.config'
import nlpConfig, { nlpConfigSchema } from './config/nlp.config'
import ollamaConfig, { ollamaConfigSchema } from './config/ollama.config'
import redisConfig, { redisConfigSchema } from './config/redis.config'
import { NlpModule } from './nlp/nlp.module'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { ThoughtsModule } from './thoughts/thoughts.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, redisConfig, nlpConfig, jwtConfig, ollamaConfig],
      validationSchema: appConfigSchema.concat(jwtConfigSchema).concat(nlpConfigSchema).concat(redisConfigSchema).concat(ollamaConfigSchema),
      validationOptions: {
        abortEarly: true
      }
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
