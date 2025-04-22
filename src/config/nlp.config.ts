import { registerAs } from '@nestjs/config'

export default registerAs('nlp', () => ({
  classificationThreshold: parseFloat(process.env.CLASSIFIER_THRESHOLD) || 0.7,
  cacheTtl: parseInt(process.env.NLP_CACHE_TTL, 10) || 3600,
}))