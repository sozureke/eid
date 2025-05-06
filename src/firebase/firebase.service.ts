import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { PrismaService } from 'prisma/prisma.service'
import { FIREBASE_QUEUE, FIREBASE_QUEUE_PUSH_JOB } from './firebase.queue'

@Injectable()
export class FirebaseService {
	constructor(
    @InjectQueue(FIREBASE_QUEUE) private readonly queue: Queue,
    private readonly prisma: PrismaService
  ) {}

	async sendPush(token: string, notification: { title: string; body: string }) {
    await this.queue.add(FIREBASE_QUEUE_PUSH_JOB, {
      token,
      notification,
    }, {
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
      removeOnFail: true,
    });
  }

  async sendToUser(userId: string, n: { title: string; body: string }) {
    const tokens = await this.prisma.device.findMany({
      where: { userId },
      select: { pushToken: true },
    })
    await Promise.all(tokens.map(t => this.sendPush(t.pushToken, n)))
  }
}
