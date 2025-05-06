import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from 'prisma/prisma.module'
import { DeviceCleanupService } from './device-cleanup.service'

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [DeviceCleanupService],
  exports: [],
})
export class DeviceModule {}
