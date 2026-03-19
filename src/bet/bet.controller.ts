import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BetService } from './bet.service';
import { CreateBetDto } from './dtos/create-bet.dto';
import { UpdateBetDto } from './dtos/update-bet.dto';
import { Environment } from '../enums/role.Environment';

@Controller('bets')
export class BetController {
  constructor(private readonly betService: BetService) {}

  @Post()
  create(@Body() createBetDto: CreateBetDto) {
    return this.betService.create(createBetDto);
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

  @Get('game/:gameId')
  findByGame(@Param('gameId') gameId: string) {
    return this.betService.findByGame(gameId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBetDto: UpdateBetDto) {
    return this.betService.update(id, updateBetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.betService.remove(id);
  }
}
