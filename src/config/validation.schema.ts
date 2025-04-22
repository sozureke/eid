import * as Joi from '@hapi/joi'

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number().default(4200),

  DATABASE_URL: Joi.string().uri().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  OLLAMA_HOST: Joi.string().uri().default('http://127.0.0.1:11434'),
  OLLAMA_MODEL: Joi.string().default('mistral'),
  OLLAMA_TEMPERATURE: Joi.number().min(0).max(1).default(0.7),
  OLLAMA_MAX_TOKENS: Joi.number().default(250),

  CLASSIFIER_THRESHOLD: Joi.number().min(0).max(1).default(0.7),
  NLP_CACHE_TTL: Joi.number().default(3600),
})
