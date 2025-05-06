import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from 'prisma/prisma.service'

@Injectable()
export class DeviceCleanupService {
  private readonly log = new Logger(DeviceCleanupService.name)
  private readonly ttlDays = 30

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 4 * * *')
  async purgeStale() {
    const before = new Date(Date.now() - this.ttlDays * 864e5)
    const { count } = await this.prisma.device.deleteMany({
      where: { lastSeen: { lt: before } },
    })
    if (count) this.log.log(`Purged ${count} stale device tokens`)
  }
}
