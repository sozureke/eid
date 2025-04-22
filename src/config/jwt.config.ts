import * as Joi from '@hapi/joi'
import { registerAs } from '@nestjs/config'

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET as string,
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
}))

export const jwtConfigSchema = Joi.object({
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
})

export const jwtModuleOptions = {
  inject: [process.env.JWT_SECRET],
  useFactory: () => ({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
  }),
}