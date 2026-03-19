import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';
import { IsOptional, IsInt, IsEnum } from 'class-validator';

enum GameStatus {
  SCHEDULED = 'SCHEDULED',
  CLOSED = 'CLOSED',
  FINISHED = 'FINISHED',
}

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @IsOptional()
  @IsEnum(GameStatus, {
    message: 'Status deve ser SCHEDULED, CLOSED ou FINISHED!',
  })
  status?: GameStatus;

  @IsOptional()
  @IsInt({ message: 'Gols do time da casa deve ser um número inteiro!' })
  homeScore?: number;

  @IsOptional()
  @IsInt({ message: 'Gols do time visitante deve ser um número inteiro!' })
  awayScore?: number;
}
