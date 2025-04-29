import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from 'prisma/prisma.module'
import { TfaController } from './tfa.controller'
import { TfaService } from './tfa.service'

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [TfaService],
  controllers: [TfaController]
})
export class TfaModule {}
