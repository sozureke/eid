import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from 'src/prisma/prisma.service'
import { ROLES_KEY } from '../roles.decorator'


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<string[]>(ROLES_KEY, ctx.getHandler())
    if (!required) return true

    const req = ctx.switchToHttp().getRequest()
    const uid = req.user.userId
    const user = await this.prisma.user.findUnique({ where: { id: uid } })
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('Insufficient role')
    }
    return true
  }
}
