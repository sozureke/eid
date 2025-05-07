import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { promises as fs } from 'fs'
import Redis from 'ioredis'
import path from 'path'
import { PrismaService } from 'prisma/prisma.service'

@Injectable()
export class EchoService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private readonly cooldownMessage =
    "Nothing changed. Sometimes trying again doesn't help — come back tomorrow."
  private readonly lockKey = (userId: string) => `echo:locked:${userId}`

  private async loadDefaultPhrases(): Promise<string[]> {
    const filePath = path.join(process.cwd(), 'prisma/seed/echo.json')
    if (!filePath) throw new Error('File path is not defined')

    const file = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(file) as string[]
  }

  async getUserEcho(userId: string): Promise<string[] | null> {
    const record = await this.prismaService.userEcho.findUnique({
      where: { userId },
    })
    return record?.phrases ?? []
  }

  async rerollEcho(userId: string): Promise<string[]> {
    const ttl = await this.redis.ttl(this.lockKey(userId))
    if (ttl > 0) {
      throw new ForbiddenException({
        message: this.cooldownMessage,
        retryAfter: ttl,
      })
    }

    const defaultPhrases = await this.loadDefaultPhrases()
    const selected = this.pickRandom(defaultPhrases, 3)

    await this.prismaService.userEcho.upsert({
      where: { userId },
      update: { phrases: selected },
      create: { userId, phrases: selected },
    })

    const expireIn = this.getSecondsUntilMidnight()
    await this.redis.set(this.lockKey(userId), 1, 'EX', expireIn)

    return selected
  }

  private pickRandom<T>(array: T[], count: number): T[] {
    return [...array].sort(() => Math.random() - 0.5).slice(0, count)
  }

  private getSecondsUntilMidnight(): number {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setUTCHours(24, 0, 0, 0)
    return Math.floor((midnight.getTime() - now.getTime()) / 1000)
  }
}
