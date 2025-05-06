import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import * as crypto from 'crypto'
import { Response } from 'express'
import { Redis } from 'ioredis'
import { PrismaService } from '../prisma/prisma.service'
import { DevicePingDto } from './dto/device-ping.dto'

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

  async refreshTokens(token: string, res: Response): Promise<{ accessToken: string }> {
    const userId = await this.redis.get(`refresh:${token}`)
    if (!userId) throw new UnauthorizedException('Invalid refresh token')
  
    const hasDevice = await this.prisma.device.count({ where: { userId } })
    if (!hasDevice) throw new UnauthorizedException('No active device')
  
    return this.generateTokens(userId, res)
  }

  async logout(token: string, res: Response): Promise<void> {
    await this.redis.del(`refresh:${token}`)
    res.clearCookie('refreshToken')
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

  async registerDevice(userId: string, dto: DevicePingDto) {
    await this.prisma.device.upsert({
      where: { pushToken: dto.pushToken },
      create: { userId, ...dto, lastSeen: new Date() },
      update: { userId, platform: dto.platform, lastSeen: new Date() },
    })
  }
}
