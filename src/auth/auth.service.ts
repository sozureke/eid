import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import * as crypto from 'crypto'
import { Response } from 'express'
import { Redis } from 'ioredis'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async getOrCreateUserByDevice(deviceUid: string): Promise<User> {
    return this.prisma.user.upsert({
      where: { deviceUid },
      update: {},
      create: { deviceUid },
    })
  }

  async signInAnonymously(deviceUid: string, res: Response): Promise<{ accessToken: string }> {
    const user = await this.getOrCreateUserByDevice(deviceUid)
    const tokens = await this.generateTokens(user.id, res)
    return { accessToken: tokens.accessToken }
  }

  async refreshTokens(token: string, deviceUid: string, res: Response): Promise<{ accessToken: string }> {
    const userId = await this.redis.get(`refresh:${token}`)
    if (!userId) throw new UnauthorizedException('Invalid refresh token')

    const user = await this.prisma.user.findFirst({ where: { id: userId, deviceUid } })
    if (!user) throw new UnauthorizedException('Device mismatch')

    return this.generateTokens(user.id, res)
  }

  async logout(token: string, res: Response): Promise<void> {
    await this.redis.del(`refresh:${token}`)
    res.clearCookie('refreshToken')
  }

  async confirmLinkToken(linkToken: string, newDeviceUid: string, res: Response): Promise<{ accessToken: string }> {
    const key = `linkToken:${linkToken}`
    const userIdStr = await this.redis.get(key)
    if (!userIdStr) {
      throw new UnauthorizedException('Invalid or expired link token')
    }

    await this.prisma.user.update({
      where: { id: userIdStr },
      data: { deviceUid: newDeviceUid },
    })

    await this.redis.del(key)
    return this.generateTokens(userIdStr, res)
  }

  async generateTokens(userId: string, res: Response): Promise<{ accessToken: string }> {
    const accessToken = this.jwt.sign({ sub: userId })
    const refreshToken = crypto.randomUUID()

    await this.redis.set(`refresh:${refreshToken}`, userId, 'EX', 60 * 60 * 24 * 7)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return { accessToken }
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) throw new UnauthorizedException('User not found')
    return user
  }

  async requestLinkToken(userId: string): Promise<{ linkToken: string }> {
    const linkToken = crypto.randomBytes(32).toString('hex')
    await this.redis.set(`linkToken:${linkToken}`, userId, 'EX', 600)
    return { linkToken }
  }
}
