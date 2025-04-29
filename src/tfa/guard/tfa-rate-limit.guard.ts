import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { BadRequestException } from '@nestjs/common/exceptions'
import Redis from 'ioredis'

@Injectable()
export class TfaRateLimitGuard implements CanActivate {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const userId = req.user?.userId

    if (!userId) {
      throw new BadRequestException('Missing user id')
    }

    const key = `tfa:attempts:${userId}`
    const attempts = +(await this.redis.get(key)) || 0

    if (attempts >= 5) {
      throw new BadRequestException('Too many TFA attempts. Try again later.')
    }

    await this.redis.multi()
      .incr(key)
      .expire(key, 300)
      .exec()

    return true
  }
}