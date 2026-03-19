import { ReturnBetDto } from '../dtos/return-bet.dto';

export class BetEntity implements ReturnBetDto {
  id!: string;
  userId!: string;
  gameId!: string;
  option!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<BetEntity>) {
    Object.assign(this, partial);
  }
}
