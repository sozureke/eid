import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'

import { FIREBASE_QUEUE } from '../firebase/firebase.queue'
import { SendPushDto } from './dto/send-push.dto'

@Injectable()
export class NotificationService {
  constructor(@InjectQueue(FIREBASE_QUEUE) private readonly queue: Queue) {}

  async sendPush(dto: SendPushDto) {
    await this.queue.add('send', dto)
  }
}
