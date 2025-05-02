import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { FIREBASE_QUEUE } from '../firebase/firebase.queue'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

@Module({
  imports: [BullModule.registerQueue({ name: FIREBASE_QUEUE })],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
