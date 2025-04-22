import { ValidationPipe } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import appConfig from './config/app.config'
import { swaggerConfig } from './config/swagger.config'

const morgan = require('morgan')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY, { strict: false })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       
      forbidNonWhitelisted: true, 
      transform: true
    }),
  )
  
  app.setGlobalPrefix('api')
  app.use(morgan('combined'))
  app.use(helmet())
  app.useGlobalFilters(new HttpExceptionFilter())

  swaggerConfig(app)
  await app.listen(config.port)
}
bootstrap()
