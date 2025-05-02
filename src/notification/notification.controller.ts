import { Body, Controller, Post } from '@nestjs/common'
import { SendPushDto } from './dto/send-push.dto'
import { NotificationService } from './notification.service'

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  sendPush(@Body() dto: SendPushDto) {
    return this.notificationService.sendPush(dto)
  }
}
