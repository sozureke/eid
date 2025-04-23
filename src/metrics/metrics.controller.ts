import { Controller, Get, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import * as client from 'prom-client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guard/roles.guard'
import { Roles } from 'src/auth/roles.decorator'

@Controller('metrics')
export class MetricsController {
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', client.register.contentType)
    res.end(await client.register.metrics())
  }
}
