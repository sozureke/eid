import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { PrismaModule } from 'prisma/prisma.module'
import { VoidCronService } from './void-cron.service'
import { VoidController } from './void.controller'
import { VoidService } from './void.service'

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    EventEmitterModule.forRoot()],
  
  controllers: [VoidController],
  providers: [VoidService, VoidCronService],
  exports: [VoidService]
})
export class VoidModule {}
