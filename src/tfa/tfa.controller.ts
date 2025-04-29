import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard'
import { TfaRateLimitGuard } from './guard/tfa-rate-limit.guard'
import { TfaService } from './tfa.service'

@Controller('tfa')
@UseGuards(JwtAuthGuard)
export class TfaController {
  constructor(private readonly tfa: TfaService) {}

  @Post('setup')
  async setup(@Request() req) {
    return this.tfa.setup(req.user.userId)
  }

  @UseGuards(TfaRateLimitGuard)
  @Post('verify')
  async verify(
    @Request() req,
    @Body('code') code: string,
  ) {
    await this.tfa.verify(req.user.userId, code)
    return { ok: true }
  }
}
