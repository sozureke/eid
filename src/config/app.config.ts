import * as Joi from '@hapi/joi'
import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV as 'development' | 'production' | 'test',
}))

export const appConfigSchema = Joi.object({
  PORT: Joi.number().default(4200),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
})