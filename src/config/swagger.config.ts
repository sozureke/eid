import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const swaggerConfig = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('EID API')
    .setDescription('EID-backend documentation')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)
}
