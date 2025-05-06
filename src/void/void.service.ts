import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { FirebaseService } from 'firebase/firebase.service'
import { Redis } from 'ioredis'
import { TransformService } from 'nlp/transform.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class VoidService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transformService: TransformService,
    private readonly firebaseService: FirebaseService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async startVoidSession(userId: string) {
    const existing = await this.prisma.voidSession.findFirst({
      where: { userId, endedAt: null },
    })
    if (existing) {
      throw new BadRequestException('Void session already started')
    }

    const session = await this.prisma.voidSession.create({
      data: { userId },
    })

    await this.redis.set(`void:session:${userId}`, session.id, 'EX', 43200)

    return session
  }

  async stopVoidSession(userId: string) {
    const session = await this.prisma.voidSession.findFirst({
      where: { userId, endedAt: null },
    })
  
    if (!session) {
      throw new BadRequestException('No active void session')
    }
  
    const ended = new Date()
    const updated = await this.prisma.voidSession.update({
      where: { id: session.id },
      data: { endedAt: ended },
    })
  
    await this.redis.del(`void:session:${userId}`)
  
    const durationMs  = ended.getTime() - session.startedAt.getTime()
    const durationMin = Math.floor(durationMs / 60000)
  
    const msg = await this.transformService.pushMessage('void-end', { durationMin })
  
    await this.firebaseService.sendToUser(userId, msg)
  
    return {
      voidSession: updated,
      durationMs,
    }
  }
  
  

  async autoStopSession(userId: string) {
    const session = await this.prisma.voidSession.findFirst({
      where: { userId, endedAt: null },
    })
    if (session) {
      await this.stopVoidSession(userId)
    }
  }
}
