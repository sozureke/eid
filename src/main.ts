import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { swaggerConfig } from './config/swagger.config'

const morgan = require('morgan')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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
  await app.listen(4200)
}
bootstrap()
