import {
	Controller,
	Get,
	HttpCode,
	Patch,
	Req,
	UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard'
import { EchoService } from './echo.service'

@Controller('echo')
@UseGuards(JwtAuthGuard)
export class EchoController {
  constructor(private readonly echoService: EchoService) {}

  @Get()
  async getEcho(@Req() req) {
    return this.echoService.getUserEcho(req.user.userId)
  }

  @Patch('reroll')
  @HttpCode(200)
  async reroll(@Req() req) {
    return this.echoService.rerollEcho(req.user.userId)
  }
}
