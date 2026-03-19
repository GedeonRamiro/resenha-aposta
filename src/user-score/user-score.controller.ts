import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserScoreService } from './user-score.service';

@Controller('user-scores')
export class UserScoreController {
  constructor(private readonly userScoreService: UserScoreService) {}

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.userScoreService.findAll(startDate, endDate);
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.userScoreService.findOne(userId);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.userScoreService.findByUser(userId, startDate, endDate);
  }
}
