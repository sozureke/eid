import { PartialType } from '@nestjs/mapped-types'
import { CreatePresetThoughtDto } from './create-preset-thought.dto'

export class UpdatePresetThoughtDto extends PartialType(CreatePresetThoughtDto) {}
