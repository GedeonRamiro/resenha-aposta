import { UserEntity } from '../../user/entities/user.entity';

export interface RankingItem {
  user: UserEntity;
  points: number;
  bets: number;
}
