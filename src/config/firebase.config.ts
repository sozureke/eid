import * as Joi from '@hapi/joi'
import { registerAs } from '@nestjs/config'
import * as fs from 'fs'

export default registerAs('firebase', () => {
  const path = process.env.FIREBASE_CREDENTIALS_PATH
  if (!path) throw new Error('FIREBASE_CREDENTIALS_PATH is not defined')

  const file = fs.readFileSync(path, 'utf8')
  const credentials = JSON.parse(file)

  return {
    projectId: credentials.project_id,
    clientEmail: credentials.client_email,
    privateKey: credentials.private_key.replace(/\\n/g, '\n'),
  }
})

export const firebaseConfigSchema = Joi.object({
  FIREBASE_CREDENTIALS_PATH: Joi.string().required()
})
