import {
  IsString,
  MinLength,
  IsISO8601,
  IsOptional,
  Matches,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

enum GameType {
  LEAGUE_GROUP = 'LEAGUE_GROUP',
  KNOCKOUT = 'KNOCKOUT',
}

export class CreateGameDto {
  @IsISO8601(undefined, {
    message: 'Data do jogo deve estar em formato ISO8601!',
  })
  @Matches(/(Z|[+-]\d{2}:\d{2})$/, {
    message: 'Data do jogo deve incluir timezone (Z ou ±HH:mm)!',
  })
  gameDate: string;

  @IsOptional()
  @IsEnum(GameType, {
    message: 'Tipo do jogo deve ser LEAGUE_GROUP ou KNOCKOUT!',
  })
  gameType?: GameType;

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

  @IsString({ message: 'ID do time da casa deve ser uma string!' })
  @MinLength(1, { message: 'ID do time da casa é obrigatório!' })
  homeTeamId: string;

  @IsString({ message: 'ID do time visitante deve ser uma string!' })
  @MinLength(1, { message: 'ID do time visitante é obrigatório!' })
  awayTeamId: string;

  @IsString({ message: 'ID da competição deve ser uma string!' })
  @MinLength(1, { message: 'ID da competição é obrigatório!' })
  competitionId: string;

  @IsOptional()
  @IsString({ message: 'Mais informações deve ser uma string!' })
  moreInfo?: string;
}
