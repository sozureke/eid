import ollamaConfig from '@config/ollama.config'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import axios from 'axios'
import { ClassificationInput, ClassificationResult } from './nlp.types'
import { prompts } from './prompts/nlp-thoughts-prompts.config'

@Injectable()
export class ClassifierService {
  constructor(
    @Inject(ollamaConfig.KEY) private readonly config: ConfigType<typeof ollamaConfig>,
  ) {}

  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const template = Handlebars.compile(prompts.classify)
    const prompt = template({
      title: input.title,
      details: input.details,
    })

    const url = this.config.host
    const model = this.config.model
    const maxTokens = this.config.maxTokens

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
