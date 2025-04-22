import { ThoughtStatus } from '@prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class CompleteThoughtDto {
  @IsString({message: 'thoughtId must be a string'})
  thoughtId: string

  @IsEnum(ThoughtStatus)
  @IsOptional()
  status?: ThoughtStatus
}