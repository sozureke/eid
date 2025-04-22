import { DueFlavour } from '@prisma/client'
import { IsEnum, IsOptional } from 'class-validator'

export class GetThoughtsQueryDto {
  @IsOptional()
  @IsEnum(DueFlavour)
  dueFlavour?: DueFlavour
}