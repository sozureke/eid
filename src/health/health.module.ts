import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../prisma/prisma.module'
import { RedisModule } from '../redis/redis.module'
import { HealthService } from './health.service'

@Module({
  imports: [ConfigModule, RedisModule, PrismaModule],
  providers: [HealthService],
  exports: [HealthService]
})
export class HealthModule {}
