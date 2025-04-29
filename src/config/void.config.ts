import { registerAs } from '@nestjs/config'

export default registerAs('void', () => ({
  maxSessionDurationMs: parseInt(process.env.VOID_MAX_SESSION_DURATION_MS ?? '3600000', 10),
}))
