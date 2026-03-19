import { Module } from '@nestjs/common';
import { UserScoreService } from './user-score.service';
import { UserScoreController } from './user-score.controller';

@Module({
  controllers: [UserScoreController],
  providers: [UserScoreService],
})
export class UserScoreModule {}
