import { ReturnGameDto } from '../dtos/return-game.dto';

export class GameEntity implements ReturnGameDto {
  id!: string;
  homeTeam!: string;
  awayTeam!: string;
  gameDate!: Date;
  betCloseAt!: Date;
  status!: string;
  homeScore!: number | null;
  awayScore!: number | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<GameEntity>) {
    Object.assign(this, partial);
  }
}
