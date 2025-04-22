import * as Joi from '@hapi/joi'
import { registerAs } from '@nestjs/config'

export default registerAs('nlp', () => ({
  classificationThreshold: parseFloat(process.env.CLASSIFIER_THRESHOLD) || 0.7,
  cacheTtl: parseInt(process.env.NLP_CACHE_TTL, 10) || 3600,
}))

export const nlpConfigSchema = Joi.object({
  CLASSIFIER_THRESHOLD: Joi.number().default(0.7),
  NLP_CACHE_TTL: Joi.number().default(3600),
})