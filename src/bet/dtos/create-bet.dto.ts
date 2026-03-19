import { IsString, IsEnum } from 'class-validator';

enum BetOption {
  HOME_WIN = 'HOME_WIN',
  DRAW = 'DRAW',
  AWAY_WIN = 'AWAY_WIN',
}

export class CreateBetDto {
  @IsString({ message: 'ID do usuário deve ser uma string!' })
  userId: string;

  @IsString({ message: 'ID do jogo deve ser uma string!' })
  gameId: string;

  @IsEnum(BetOption, { message: 'Opção deve ser HOME_WIN, DRAW ou AWAY_WIN!' })
  option: BetOption;
}
