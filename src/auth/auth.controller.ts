import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { Public } from '../common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { AuthAnonDto } from './dto/auth-anon.dto'
import { DevicePingDto } from './dto/device-ping.dto'
import { JwtAuthGuard } from './guard/jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

	@Public()
  @Post('anon')
  async signInAnonymously(@Body() dto: AuthAnonDto, @Res() res: Response) {
    const result = await this.authService.signInAnonymously(dto.deviceUid, res)
    return res.json(result)
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = (req as any).cookies?.refreshToken
    if (!refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { accessToken } = await this.authService.refreshTokens(refreshToken, res)
    return res.json({ accessToken })
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.refreshToken
    if (token) await this.authService.logout(token, res)
    return res.status(204).send()
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@Req() req) {
    await this.authService.logoutFromAllDevices(req.user.userId)
    return { ok: true }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.userId)
  }

@UseGuards(JwtAuthGuard)
@Post('device/ping')
async ping(@Req() req, @Body() dto: DevicePingDto) {
  await this.authService.registerDevice(req.user.userId, dto)
  return { ok: true }
}
}
