import * as Joi from '@hapi/joi'

export const securityConfigSchema = Joi.object({
  KMS_KEY: Joi.string().length(64).required(),
})