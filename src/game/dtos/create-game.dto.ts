import {
  IsString,
  MinLength,
  IsISO8601,
  IsOptional,
  Matches,
  IsUrl,
} from 'class-validator';

export class CreateGameDto {
  @IsString({ message: 'Time da casa deve ser uma string!' })
  @MinLength(3, { message: 'Time da casa não pode estar vazio!' })
  homeTeam: string;

  @IsString({ message: 'Time visitante deve ser uma string!' })
  @MinLength(3, { message: 'Time visitante não pode estar vazio!' })
  awayTeam: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo do time da casa deve ser uma URL válida!' })
  homeTeamLogo?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo do time visitante deve ser uma URL válida!' })
  awayTeamLogo?: string;

  @IsString({ message: 'Campeonato/Liga deve ser uma string!' })
  @MinLength(3, {
    message: 'Campeonato/Liga deve ter pelo menos 3 caracteres!',
  })
  competition?: string;

  @IsISO8601(undefined, {
    message: 'Data do jogo deve estar em formato ISO8601!',
  })
  @Matches(/(Z|[+-]\d{2}:\d{2})$/, {
    message: 'Data do jogo deve incluir timezone (Z ou ±HH:mm)!',
  })
  gameDate: string;

  @IsISO8601(undefined, {
    message: 'Data de fechamento deve estar em formato ISO8601!',
  })
  @Matches(/(Z|[+-]\d{2}:\d{2})$/, {
    message: 'Data de fechamento deve incluir timezone (Z ou ±HH:mm)!',
  })
  betCloseAt: string;

  @IsOptional()
  @IsString({ message: 'Mais informações deve ser uma string!' })
  moreInfo?: string;
}
