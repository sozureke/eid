import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard'
import { Ownership } from '../common/decorators/ownership.decorators'
import { OwnershipGuard } from '../common/guards/ownership.guard'
import { CreateThoughtDto } from './dto/create-thought.dto'
import { UpdateThoughtDto } from './dto/update-thought.dto'
import { ThoughtsService } from './thoughts.service'

@UseGuards(JwtAuthGuard)
@Controller('thoughts')
export class ThoughtsController {
  constructor(private readonly thoughtService: ThoughtsService) {}

  @Get()
  findAll(@Request() req) {
    return this.thoughtService.getThoughts(req.user.userId)
  }

  @Post()
  create(@Request() req, @Body() dto: CreateThoughtDto) {
    return this.thoughtService.createThought(req.user.userId, dto)
  }

  @UseGuards(OwnershipGuard)
  @Ownership({ model: 'thought', idParam: 'id', ownerField: 'userId' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateThoughtDto
  ) {
    return this.thoughtService.updateThought(id, req.user.userId, dto)
  }

  @UseGuards(OwnershipGuard)
  @Ownership({ model: 'thought', idParam: 'id', ownerField: 'userId' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.thoughtService.deleteThought(id, req.user.userId)
  }

  @Get('history')
  history(@Request() req) {
    return this.thoughtService.getUserThoughtHistory(req.user.userId)
  }
}
