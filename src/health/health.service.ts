import { Inject, Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async check(): Promise<{ redis: boolean; postgres: boolean }> {
    const redisOk = await this.redis.ping().then((res) => res === 'PONG').catch(() => false)
    const pgOk = await this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false)
    return {
      redis: redisOk,
      postgres: pgOk,
    }
  }
}
