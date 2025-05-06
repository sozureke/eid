import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { Redis } from 'ioredis'
import { authenticator } from 'otplib'
import { PrismaService } from '../prisma/prisma.service'

const MAX_ATTEMPTS = 5
const BLOCK_TTL_SEC = 60 * 15
const ATTEMPT_TTL_SEC = 60 * 15

@Injectable()
export class TfaService {
  private readonly key = Buffer.from(process.env.KMS_KEY!, 'hex')

  constructor(
		@Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  encrypt(plain: string): Buffer {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.key, iv)
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return Buffer.concat([iv, tag, enc])
  }

  decrypt(buf: Buffer): string {
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const enc = buf.subarray(28)
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString()
  }

  async setup(userId: string) {
    const secret = authenticator.generateSecret()
    const otpauth = authenticator.keyuri(userId, 'Self-EID', secret)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpSecretEnc: this.encrypt(secret),
        totpEnabled: true,
      },
    })

    return { secret, otpauth }
  }

  async verify(userId: string, code: string): Promise<boolean> {
		const blockKey = `tfa:block:${userId}`;
		const failKey = `tfa:fail:${userId}`;
	
		const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

		if (user.totpEnabled) {
			throw new BadRequestException('TFA is already activated');
		}
	
		const isBlocked = await this.redis.get(blockKey);
		if (isBlocked) {
			throw new ForbiddenException('Account temporarily locked due to repeated failed attempts');
		}
	
		if (!user.totpSecretEnc) {
			throw new BadRequestException('TOTP not set');
		}
	
		const secret = this.decrypt(Buffer.from(user.totpSecretEnc));
		const ok = authenticator.check(code, secret);
	
		if (!ok) {
			const fails = await this.redis.incr(failKey);
			if (fails === 1) {
				await this.redis.expire(failKey, ATTEMPT_TTL_SEC);
			}
	
			if (fails >= MAX_ATTEMPTS) {
				await this.redis.set(blockKey, '1', 'EX', BLOCK_TTL_SEC);
				await this.redis.del(failKey);
				throw new ForbiddenException('Too many attempts, account temporarily locked');
			}
	
			throw new UnauthorizedException('Invalid code');
		}
	
		await this.redis.del(failKey);
		return true;
	}
}
