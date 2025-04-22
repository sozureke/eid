import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import axios from 'axios'
import Handlebars from 'handlebars'
import ollamaConfig from 'src/config/ollama.config'
import { prompts } from './nlp-prompts.config'

@Injectable()
export class TransformService {
  constructor(
    @Inject(ollamaConfig.KEY)
    private readonly config: ConfigType<typeof ollamaConfig>
  ) {}

  async rewrite(
    title: string,
    details: string | null,
    label: string
  ): Promise<{ title: string; details?: string }> {
    const template = Handlebars.compile(prompts.transform)
    const prompt = template({ title, details, label })

    const { data } = await axios.post(`${this.config.host}/api/generate`, {
      model: this.config.model,
      prompt,
      stream: false,
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
      },
    })

    try {
      const json = JSON.parse(data.response)
      return {
        title: json.title,
        details: json.details ?? undefined,
      }
    } catch (err) {
      throw new Error('Failed to parse transform response')
    }
  }
}
