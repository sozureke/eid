import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from 'prisma/prisma.module'
import { RedisModule } from 'redis/redis.module'
import { TfaController } from './tfa.controller'
import { TfaService } from './tfa.service'

@Module({
  imports: [ConfigModule, PrismaModule, RedisModule],
  providers: [TfaService],
  controllers: [TfaController]
})
export class TfaModule {}
