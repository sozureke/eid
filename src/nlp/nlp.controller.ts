import { Body, Controller, Post } from '@nestjs/common'
import { ClassifierService } from './classifier.service'
import { ClassificationInput } from './nlp.types'
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
}
