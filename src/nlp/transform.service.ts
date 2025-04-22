import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import Handlebars from 'handlebars'
import { prompts } from './nlp-prompts.config'

@Injectable()
export class TransformService {
	constructor(private readonly config: ConfigService){}

	async rewrite(
    title: string,
    details: string | null,
    label: string
  ): Promise<{ title: string; details?: string }> {
    const template = Handlebars.compile(prompts.transform)
    const prompt = template({ title, details, label })

    const url = this.config.get<string>('ollama.host')
    const model = this.config.get<string>('ollama.model')
    const maxTokens = this.config.get<number>('ollama.maxTokens')
    const temperature = this.config.get<number>('ollama.temperature')

    const { data } = await axios.post(`${url}/api/generate`, {
      model,
      prompt,
      stream: false,
      options: {
        temperature,
        num_predict: maxTokens,
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
