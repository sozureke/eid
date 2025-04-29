import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import { DueFlavour } from '@prisma/client'
import { JwtAuthGuard } from 'auth/guard/jwt-auth.guard'
import { RolesGuard } from 'auth/guard/roles.guard'
import { Roles } from 'auth/roles.decorator'
import { ThoughtsService } from '../thoughts/thoughts.service'
import { CreatePresetThoughtDto } from './dto/create-preset-thought.dto'
import { UpdatePresetThoughtDto } from './dto/update-preset-thought.dto'

@Controller('preset-thoughts')
export class PresetThoughtsController {
  constructor(private readonly svc: ThoughtsService) {}

  @Get()
  findAll(@Query('dueFlavour') dueFlavour?: DueFlavour) {
    return this.svc.getPresetThoughts(dueFlavour)
  }

  @Get('random')
  findRandom(@Query('dueFlavour') dueFlavour?: DueFlavour) {
    return this.svc.getRandomPresetThought(dueFlavour)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.getPresetThoughtById(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreatePresetThoughtDto) {
    return this.svc.createPresetThought(dto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePresetThoughtDto
  ) {
    return this.svc.updatePresetThought(id, dto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.deletePresetThought(id)
  }
}
