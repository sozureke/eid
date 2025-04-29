import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { NlpModule } from 'nlp/nlp.module'
import { PrismaModule } from 'prisma/prisma.module'
import { RedisModule } from 'redis/redis.module'
import { PresetThoughtsController } from './preset-thoughts.controller'
import { ThoughtsController } from './thoughts.controller'
import { ThoughtsService } from './thoughts.service'

@Module({
  imports: [ConfigModule, PrismaModule, NlpModule, RedisModule],
  providers: [ThoughtsService],
  controllers: [ThoughtsController, PresetThoughtsController]
})
export class ThoughtsModule {}
