import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { AppConfigModule } from '../config/app-config.module';

@Module({
  imports: [AppConfigModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
