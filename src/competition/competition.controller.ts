import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { CreateCompetitionDto } from './dtos/create-competition.dto';
import { UpdateCompetitionDto } from './dtos/update-competition.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/decorators';
import { Environment } from '../enums/role.Environment';

@Controller('competitions')
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) {}

  @Get()
  findAll(@Query('limit') limit?: string, @Query('page') page?: string) {
    const limitNum = limit ? Number(limit) : Environment.LINE_LIMIT;
    const pageNum = page ? Number(page) : Environment.CURRENT_PAGE;

    return this.competitionService.getAll(limitNum, pageNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.competitionService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  create(@Body() dto: CreateCompetitionDto) {
    return this.competitionService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  update(@Param('id') id: string, @Body() dto: UpdateCompetitionDto) {
    return this.competitionService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  remove(@Param('id') id: string) {
    return this.competitionService.remove(id);
  }
}
