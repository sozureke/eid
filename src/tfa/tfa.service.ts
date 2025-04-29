import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { authenticator } from 'otplib'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TfaService {
		private readonly key = Buffer.from(process.env.KMS_KEY!, 'hex') 

		constructor(
			private readonly prisma: PrismaService,
			config: ConfigService,
		) {
			const kmsKey = config.get<string>('KMS_KEY')
			if (!kmsKey) throw new Error('KMS_KEY env var is missing')
			if (kmsKey.length !== 64) throw new Error('KMS_KEY must be 64-char hex (32 bytes)')
			this.key = Buffer.from(kmsKey, 'hex')
		}
		
		encrypt(plain: string): Buffer {
			const iv = randomBytes(12)
			const cipher = createCipheriv('aes-256-gcm', this.key, iv)
			const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
			const tag = cipher.getAuthTag()
			return Buffer.concat([iv, tag, enc])             
		}
	
		decrypt(buf: Buffer): string {
			const iv  = buf.subarray(0, 12)
			const tag = buf.subarray(12, 28)
			const enc = buf.subarray(28)
			const decipher = createDecipheriv('aes-256-gcm', this.key, iv)
			decipher.setAuthTag(tag)
			return Buffer.concat([decipher.update(enc), decipher.final()]).toString()
		}

		async setup(userId: string) {
			const secret = authenticator.generateSecret()
			const otpauth = authenticator.keyuri(
				userId,
				'Self-EID',
				secret
			)
			await this.prisma.user.update({
				where: { id: userId },
				data : {
					totpSecretEnc: this.encrypt(secret),
					totpEnabled:   true,
				},
			})
			return { secret, otpauth }
		}
	
		async verify(userId: string, code: string) {
			const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }})
			if (!user.totpSecretEnc) throw new BadRequestException('TOTP not set')
			const secret = this.decrypt(Buffer.from(user.totpSecretEnc))
			const ok = authenticator.check(code, secret)
			if (!ok) throw new UnauthorizedException('Invalid code')
			return true
		}
}
