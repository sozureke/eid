import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'auth/guard/jwt-auth.guard'
import { RolesGuard } from 'auth/guard/roles.guard'
import { Roles } from 'auth/roles.decorator'
import { ClassifierService } from './classifier.service'
import { ClassificationInput } from './nlp.types'
import { pushPrompts } from './prompts/nlp-notifications-promts.config'
import { TransformService } from './transform.service'

@Controller('nlp')
export class NlpController {
  constructor(
    private readonly classifier: ClassifierService,
    private readonly transformer: TransformService
  ) {}

  @Post('classify')
  async classify(@Body() input: ClassificationInput) {
    const result = await this.classifier.classify(input)
    return { ...result, toxic: this.classifier.isToxic(result.label) }
  }

  @Post('transform')
  async transform(@Body() body: { title: string; details?: string; label: string }) {
    return this.transformer.rewrite(body.title, body.details ?? null, body.label)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('push')
  async push(@Body() body: { type: keyof typeof pushPrompts; context: Record<string, any> }) {
    return this.transformer.pushMessage(body.type, body.context)
  }
}
