import { ReturnUserDto } from '../../user/dtos/return-user.dto';

export interface RankingItem {
  user: ReturnUserDto;
  points: number;
  bets: number;
}
