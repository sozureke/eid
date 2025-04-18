import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthAnonDto } from './dto/auth-anon.dto'
import { AuthLinkConfirmDto } from './dto/auth-link-confirm.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('anon')
	async signInAnonymously(@Body() dto: AuthAnonDto) {
		return this.authService.signInAnonymously(dto.deviceUid)
	}

	@UseGuards(AuthGuard('jwt'))
	@Post('link-request')
	async linkRequest(@Request() req) {
		return this.authService.requestLinkToken(req.user.userId)
	}
	
	@Post('link-confirm')
	async linkConfirm(@Body() dto: AuthLinkConfirmDto) {
		return this.authService.confirmLinkToken(dto.linkToken, dto.newDeviceUid)
	}


	@UseGuards(AuthGuard('jwt'))
	@Get('me')
	async getProfile(@Request() req) {
		return this.authService.getProfile(req.user.userId)
	}
}
