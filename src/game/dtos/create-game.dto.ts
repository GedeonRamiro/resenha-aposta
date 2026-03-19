import { IsString, MinLength, IsISO8601 } from 'class-validator';

export class CreateGameDto {
  @IsString({ message: 'Time da casa deve ser uma string!' })
  @MinLength(3, { message: 'Time da casa não pode estar vazio!' })
  homeTeam: string;

  @IsString({ message: 'Time visitante deve ser uma string!' })
  @MinLength(3, { message: 'Time visitante não pode estar vazio!' })
  awayTeam: string;

  @IsISO8601(undefined, {
    message: 'Data do jogo deve estar em formato ISO8601!',
  })
  gameDate: string;

  @IsISO8601(undefined, {
    message: 'Data de fechamento deve estar em formato ISO8601!',
  })
  betCloseAt: string;
}
