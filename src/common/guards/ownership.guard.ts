import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../../prisma/prisma.service'
import { OWNERSHIP_KEY, OwnershipOptions } from '../decorators/ownership.decorators'


@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const opts = this.reflector.get<OwnershipOptions>(
      OWNERSHIP_KEY,
      ctx.getHandler(),
    )
    if (!opts) {
      return true
    }

    const { model, idParam, ownerField } = opts

    const req = ctx.switchToHttp().getRequest()
    const userId: string = req.user?.userId
    if (!userId) {
      throw new ForbiddenException('User not authenticated')
    }

    const recordId = req.params[idParam] ?? req.body[idParam]
    if (!recordId) {
      throw new ForbiddenException(`Missing resource identifier "${idParam}"`)
    }

    const record = await (this.prisma as any)[model].findUnique({
      where: { id: recordId },
    })
    if (!record) {
      throw new NotFoundException(`${model} ${recordId} not found`)
    }

    if (record[ownerField] !== userId) {
      throw new ForbiddenException(`You do not own this ${model}`)
    }

    return true
  }
}
