import { DueFlavour } from '@prisma/client'
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator'

export class CreatePresetThoughtDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  details?: string

  @IsEnum(DueFlavour)
  dueFlavour: DueFlavour

  @IsInt()
  categoryId: number

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  fuelIds: number[]
}
