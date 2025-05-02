import firebaseConfig from '@config/firebase.config'
import { BullModule } from '@nestjs/bull'
import { Inject, Module, OnModuleInit } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { cert, initializeApp } from 'firebase-admin/app'
import { FirebaseController } from './firebase.controller'
import { FirebaseProcessor } from './firebase.processor'
import { FIREBASE_QUEUE } from './firebase.queue'
import { FirebaseService } from './firebase.service'

@Module({
  imports: [
    BullModule.registerQueue({
      name: FIREBASE_QUEUE,
    }),
  ],
  providers: [FirebaseService, FirebaseProcessor],
  controllers: [FirebaseController],
  exports: [FirebaseService],
})
export class FirebaseModule implements OnModuleInit {
  constructor(
    @Inject(firebaseConfig.KEY)
    private readonly config: ConfigType<typeof firebaseConfig>,
  ) {}

  onModuleInit() {
    initializeApp({
      credential: cert({
        projectId: this.config.projectId,
        clientEmail: this.config.clientEmail,
        privateKey: this.config.privateKey,
      }),
    })
  }
}
