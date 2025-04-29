import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class TfaGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>()
    const auth = req.headers.authorization?.split(' ')
    if (!auth || auth[0] !== 'Bearer' || !auth[1]) {
      throw new ForbiddenException('TFA required')
    }

    let payload: any
    try {
      payload = this.jwtService.verify(auth[1])
    } catch {
      throw new ForbiddenException('Invalid token')
    }

    if (!payload.tfa_verified) {
      throw new ForbiddenException('TFA not verified')
    }
		
    req.user = payload  
    return true
  }
}
