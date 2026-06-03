import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BetService } from './bet.service';
import { CreateBetDto } from './dtos/create-bet.dto';
import { UpdateBetDto } from './dtos/update-bet.dto';
import { Environment } from '../enums/role.Environment';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/decorators';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('bets')
export class BetController {
  constructor(private readonly betService: BetService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'PLAYER', 'MODERATOR')
  create(@Body() createBetDto: CreateBetDto, @CurrentUser() user: User) {
    return this.betService.create({ ...createBetDto, userId: user.id });
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const limitNum = limit ? Number(limit) : Environment.LINE_LIMIT;
    const pageNum = page ? Number(page) : Environment.CURRENT_PAGE;
    return this.betService.getAll(limitNum, pageNum, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.betService.findOne(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.betService.findByUser(userId);
  }

  @Get('user/:userId/paginated')
  findByUserPaginated(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const limitNum = limit ? Number(limit) : Environment.LINE_LIMIT;
    const pageNum = page ? Number(page) : Environment.CURRENT_PAGE;

    return this.betService.getByUserPaginated(userId, limitNum, pageNum);
  }

  @Get('game/:gameId')
  findByGame(@Param('gameId') gameId: string) {
    return this.betService.findByGame(gameId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'PLAYER', 'MODERATOR')
  update(
    @Param('id') id: string,
    @Body() updateBetDto: UpdateBetDto,
    @CurrentUser() user: User,
  ) {
    return this.betService.update(id, updateBetDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.betService.remove(id);
  }
}
