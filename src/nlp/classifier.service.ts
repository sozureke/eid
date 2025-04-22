import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import Handlebars from 'handlebars'
import { Redis } from 'ioredis'
import { prompts } from './nlp-prompts.config'
import { ClassificationInput, ClassificationResult } from './nlp.types'

@Injectable()
export class ClassifierService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {}

  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const template = Handlebars.compile(prompts.classify)
    const prompt = template({
      title: input.title,
      details: input.details,
    })

    const url = this.config.get<string>('ollama.host')
    const model = this.config.get<string>('ollama.model')
    const maxTokens = this.config.get<number>('ollama.maxTokens')

    const { data } = await axios.post(`${url}/api/generate`, {
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.0,
        num_predict: maxTokens,
      },
    })

    try {
      const json = JSON.parse(data.response)
      return {
        label: json.label,
        score: json.score,
      }
    } catch (err) {
      throw new Error('Failed to parse classification response')
    }
  }

  isToxic(label: string): boolean {
    return ['guilt', 'ambition', 'fear_of_missing_out'].includes(label)
  }

  meetsThreshold(score: number): boolean {
    return score >= 0.7
  }
}
