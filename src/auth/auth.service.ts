import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import * as crypto from 'crypto'
import { Redis } from 'ioredis'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
	constructor(
		@Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService) {}

  async getOrCreateUserByDevice(deviceUid: string): Promise<User> {
    return this.prisma.user.upsert({
      where: { deviceUid },
      update: {},
      create: { deviceUid }
    })
  }

	async signInAnonymously(deviceUid: string): Promise<{ token: string }> {
		const user = await this.getOrCreateUserByDevice(deviceUid)
		const token = await this.jwt.sign({ sub: user.id.toString()})
		return { token }
	}

	async requestLinkToken(userId: string): Promise<{ linkToken: string}> {
		const linkToken = crypto.randomBytes(32).toString('hex')
		await this.redis.set(`linkToken:${linkToken}`, String(userId), 'EX', 60 * 60 * 24)
		return { linkToken }
	}

	async confirmLinkToken(
    linkToken: string,
    newDeviceUid: string,
  ): Promise<{ token: string }> {
    const key = `link:token:${linkToken}`
    const userIdStr = await this.redis.get(key)
    if (!userIdStr) {
      throw new UnauthorizedException('Invalid or expired link token')
    }

    const userId = userIdStr
		await this.prisma.user.update({
      where: { id: userId },
      data: { deviceUid: newDeviceUid },
    })
    await this.redis.del(key)

    const token = this.jwt.sign({ sub: userId.toString() })
    return { token }
  }

	async getProfile(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      throw new UnauthorizedException('User not found')
    }
    return user
  }
}
