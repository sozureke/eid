import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { FIREBASE_QUEUE, FIREBASE_QUEUE_PUSH_JOB } from './firebase.queue'

@Injectable()
export class FirebaseService {
	constructor(
    @InjectQueue(FIREBASE_QUEUE) private readonly queue: Queue
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
}
