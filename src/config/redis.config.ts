export const redisConfig = () => ({
  host: process.env.REDIS_HOST as string,
  port: parseInt(process.env.REDIS_PORT, 10)
})
