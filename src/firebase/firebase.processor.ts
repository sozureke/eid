import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { getMessaging } from 'firebase-admin/messaging'
import { FIREBASE_QUEUE, FIREBASE_QUEUE_PUSH_JOB } from './firebase.queue'

@Processor(FIREBASE_QUEUE)
export class FirebaseProcessor {
  private readonly logger = new Logger(FirebaseProcessor.name);

  @Process(FIREBASE_QUEUE_PUSH_JOB)
  async handleSendPush(job: any) {
    const { token, notification } = job.data;
    try {
      await getMessaging().send({
        token,
        notification,
      });
      this.logger.log(`✅ Push is sent: ${notification.title}`);
    } catch (err) {
      this.logger.error(`❌ Failed to send a push: ${err.message}`, err.stack);
      throw err
    }
  }
}
