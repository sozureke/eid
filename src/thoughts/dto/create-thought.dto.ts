import { ThoughtStatus } from '@prisma/client'
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'

export class CreateThoughtDto {
  @IsString({message: 'Title must be a string'})
  title: string;

  @IsOptional()
  @IsString({message: 'Details must be a string'})
  details?: string;

  @IsOptional()
  @IsEnum(ThoughtStatus)
  status?: ThoughtStatus;

  @IsOptional()
  @IsDateString({})
  dueAt?: string;
}