import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';
import { IsOptional, IsInt, IsEnum, IsString, Min } from 'class-validator';

enum GameStatus {
  SCHEDULED = 'SCHEDULED',
  CLOSED = 'CLOSED',
  FINISHED = 'FINISHED',
}

enum GameType {
  LEAGUE_GROUP = 'LEAGUE_GROUP',
  KNOCKOUT = 'KNOCKOUT',
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

  @IsOptional()
  @IsInt({ message: 'Placar da volta da casa deve ser um número inteiro!' })
  @Min(0, {
    message: 'Placar da volta da casa deve ser maior ou igual a zero!',
  })
  secondLegHomeScore?: number;

  @IsOptional()
  @IsInt({
    message: 'Placar da volta do visitante deve ser um número inteiro!',
  })
  @Min(0, {
    message: 'Placar da volta do visitante deve ser maior ou igual a zero!',
  })
  secondLegAwayScore?: number;

  @IsOptional()
  @IsInt({ message: 'Pênaltis do time da casa deve ser um número inteiro!' })
  penaltyHomeScore?: number;

  @IsOptional()
  @IsInt({ message: 'Pênaltis do time visitante deve ser um número inteiro!' })
  penaltyAwayScore?: number;

  @IsOptional()
  @IsEnum(GameType, {
    message: 'Tipo do jogo deve ser LEAGUE_GROUP ou KNOCKOUT!',
  })
  gameType?: GameType;

  @IsOptional()
  @IsString({ message: 'ID do time da casa deve ser uma string!' })
  homeTeamId?: string;

  @IsOptional()
  @IsString({ message: 'ID do time visitante deve ser uma string!' })
  awayTeamId?: string;

  @IsOptional()
  @IsString({ message: 'ID da competição deve ser uma string!' })
  competitionId?: string;
}
