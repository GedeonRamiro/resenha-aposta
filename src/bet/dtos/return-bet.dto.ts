import { ReturnGameDto } from '../../game/dtos/return-game.dto';

export class ReturnBetDto {
  id: string;
  userId: string;
  gameId: string;
  option: string;
  game?: ReturnGameDto;
  createdAt: Date;
  updatedAt: Date;
}
