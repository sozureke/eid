import { Controller, Post, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard'
import { VoidService } from './void.service'


@Controller('void')
@UseGuards(JwtAuthGuard)
export class VoidController {
  constructor(private readonly voidService: VoidService) {}

  @Post('start')
  async startSession(@Request() req) {
    const session = await this.voidService.startVoidSession(req.user.userId)
    return {
      message: 'Void session started',
      voidSession: {
        id: session.id,
        startedAt: session.startedAt,
      },
    }
  }

  @Post('stop')
  async stopSession(@Request() req) {
    const { voidSession, durationMs } = await this.voidService.stopVoidSession(req.user.userId)
    return {
      message: 'Void session stopped',
      voidSession: {
        id: voidSession.id,
        startedAt: voidSession.startedAt,
        endedAt: voidSession.endedAt,
      },
      durationMs,
    }
  }
}