import { registerAs } from '@nestjs/config'

export default registerAs('ollama', () => ({
  host: process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434',
  model: process.env.OLLAMA_MODEL ?? 'mistral',
  temperature: parseFloat(process.env.OLLAMA_TEMPERATURE ?? '0.7'),
  maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS ?? '250', 10),
}))