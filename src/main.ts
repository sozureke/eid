import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import morgan from 'morgan'
import { applyMigrations } from './bootstrap'

import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exception.filter'
import { LoggerService } from './common/logger/logger.service'
import { LoggingInterceptor } from './common/logger/logging.interceptor'
import appConfig from './config/app.config'
import { swaggerConfig } from './config/swagger.config'
import { PrometheusInterceptor } from './metrics/interceptors/prometheus.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  })

  const logger = new LoggerService()
  app.useLogger(logger)

  const config = app.get(appConfig.KEY)
  const isProd = process.env.NODE_ENV === 'production'

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.setGlobalPrefix('api')
  app.use(helmet())

  if (!isProd) {
    app.use(morgan('dev'))
  }

  app.useGlobalInterceptors(new LoggingInterceptor(logger))
  app.useGlobalInterceptors(new PrometheusInterceptor())
  app.useGlobalFilters(new AllExceptionsFilter())

  if (!isProd) {
    swaggerConfig(app)
  }

  await app.listen(config.port)
  await applyMigrations()
}
bootstrap()
