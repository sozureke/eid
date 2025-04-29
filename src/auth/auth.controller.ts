import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request, Response } from 'express'
import { Public } from '../common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { AuthAnonDto } from './dto/auth-anon.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

	@Public()
  @Post('anon')
  async signInAnonymously(@Body() dto: AuthAnonDto, @Res() res: Response) {
    const result = await this.authService.signInAnonymously(dto.deviceUid, res)
    return res.json(result)
  }

  @Post('refresh')
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.refreshToken
    const deviceUid = req.body.deviceUid
    if (!token || !deviceUid) return res.status(401).json({ message: 'Unauthorized' })

    const result = await this.authService.refreshTokens(token, deviceUid, res)
    return res.json(result)
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.refreshToken
    if (token) await this.authService.logout(token, res)
    return res.status(204).send()
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.userId)
  }
}
