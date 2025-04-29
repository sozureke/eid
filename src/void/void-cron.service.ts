import voidConfig from '@config/void.config'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'prisma/prisma.service'

@Injectable()
export class VoidCronService {
  private readonly logger = new Logger(VoidCronService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(voidConfig.KEY) private readonly config: ConfigType<typeof voidConfig>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkVoidSessions() {
    this.logger.log('Checking active void sessions...')
    const now = new Date()

    const sessions = await this.prisma.voidSession.findMany({
      where: { endedAt: null },
    })

    for (const session of sessions) {
      const startedAt = session.startedAt.getTime()
      const elapsed = now.getTime() - startedAt

      if (elapsed >= this.config.maxSessionDurationMs) {
        await this.prisma.voidSession.update({
          where: { id: session.id },
          data: { endedAt: now },
        })

        this.logger.warn(`Void session ${session.id} was auto-stopped after ${elapsed / 1000}s`)
      }
    }
  }
}
