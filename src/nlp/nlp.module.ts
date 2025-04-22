import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import nlpConfig from '../config/nlp.config'
import { RedisModule } from '../redis/redis.module'
import { ClassifierService } from './classifier.service'
import { NlpController } from './nlp.controller'
import { TransformService } from './transform.service'

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(nlpConfig),
    RedisModule,
  ],
  providers: [
    ConfigModule,
    ClassifierService,
    TransformService,
  ],
  exports: [
    ClassifierService,
    TransformService,
  ],
  controllers: [NlpController],
})
export class NlpModule {}
