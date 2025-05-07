import { Module } from '@nestjs/common'
import { PrismaModule } from 'prisma/prisma.module'
import { EchoController } from './echo.controller'
import { EchoService } from './echo.service'

@Module({
  imports: [PrismaModule],
  providers: [EchoService],
  controllers: [EchoController]
})
export class EchoModule {}
