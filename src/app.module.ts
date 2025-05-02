import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'

import voidConfig from '@config/void.config'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard'
import { RolesGuard } from './auth/guard/roles.guard'
import { OwnershipGuard } from './common/guards/ownership.guard'

import appConfig, { appConfigSchema } from '@config/app.config'
import firebaseConfig, { firebaseConfigSchema } from '@config/firebase.config'
import jwtConfig, { jwtConfigSchema } from '@config/jwt.config'
import nlpConfig, { nlpConfigSchema } from '@config/nlp.config'
import ollamaConfig, { ollamaConfigSchema } from '@config/ollama.config'
import redisConfig, { redisConfigSchema } from '@config/redis.config'
import { securityConfigSchema } from '@config/tfa.config'
import { BullModule } from '@nestjs/bull'
import { FirebaseModule } from './firebase/firebase.module'
import { HealthController } from './health/health.controller'
import { HealthModule } from './health/health.module'
import { MetricsController } from './metrics/metrics.controller'
import { NlpModule } from './nlp/nlp.module'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { TfaModule } from './tfa/tfa.module'
import { ThoughtsModule } from './thoughts/thoughts.module'
import { VoidModule } from './void/void.module'
import { VoidService } from './void/void.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, redisConfig, nlpConfig, jwtConfig, ollamaConfig, voidConfig, firebaseConfig],
      validationSchema: appConfigSchema.concat(jwtConfigSchema).concat(nlpConfigSchema).concat(redisConfigSchema).concat(ollamaConfigSchema).concat(securityConfigSchema).concat(firebaseConfigSchema),
      validationOptions: {
        abortEarly: true
      }
    }),
    ThrottlerModule.forRoot({throttlers: [{
      ttl: 6000,
      limit: 10,
    }]}),

    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
      }
    }),
    AuthModule,
    PrismaModule,
    RedisModule,
    ThoughtsModule,
    NlpModule,
    HealthModule,
    TfaModule,
    VoidModule,
    FirebaseModule
  ],
  controllers: [HealthController, MetricsController],
  providers: [{provide: 'APP_GUARD', useClass: ThrottlerModule },     { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: OwnershipGuard },
    VoidService,],
})
export class AppModule {}
