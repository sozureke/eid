import ollamaConfig from '@config/ollama.config'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import axios from 'axios'
import Handlebars from 'handlebars'
import { pushPrompts } from './prompts/nlp-notifications-promts.config'
import { prompts } from './prompts/nlp-thoughts-prompts.config'

@Injectable()
export class TransformService {
  constructor(
    @Inject(ollamaConfig.KEY)
    private readonly config: ConfigType<typeof ollamaConfig>
  ) {}

  private url = `${this.config.host}/api/generate`
  
  async rewrite(
    title: string,
    details: string | null,
    label: string
  ): Promise<{ title: string; details?: string }> {
    const template = Handlebars.compile(prompts.transform)
    const prompt = template({ title, details, label })

    const { data } = await axios.post(this.url, {
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

  async pushMessage(
    type: keyof typeof pushPrompts,
    context: Record<string, any>
  ): Promise<{ title: string; body: string }> {
    const template = Handlebars.compile(pushPrompts[type])
    const prompt = template(context)

    const { data } = await axios.post(this.url, {
      model: this.config.model,
      prompt,
      stream: false,
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
      },
    })

    const { title, body } = JSON.parse(data.response)
    return { title, body }
  }
}
