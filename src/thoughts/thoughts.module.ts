import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PresetThoughtsController } from './preset-thoughts.controller'
import { ThoughtsController } from './thoughts.controller'
import { ThoughtsService } from './thoughts.service'

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [ThoughtsService],
  controllers: [ThoughtsController, PresetThoughtsController]
})
export class ThoughtsModule {}
