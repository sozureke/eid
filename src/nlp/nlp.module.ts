import nlpConfig from '@config/nlp.config'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RedisModule } from '../redis/redis.module'
import { ClassifierService } from './classifier.service'
import { NlpController } from './nlp.controller'
import { TransformService } from './transform.service'

@Module({
  imports: [
  ConfigModule.forFeature(nlpConfig),
    RedisModule
  ],
  providers: [
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
