import { ReturnUserScoreDto } from '../dtos/return-user-score.dto';
import { ReturnUserDto } from '../../user/dtos/return-user.dto';

export class UserScoreEntity implements ReturnUserScoreDto {
  id!: string;
  userId!: string;
  points!: number;
  updatedAt!: Date;
  user?: ReturnUserDto;

  constructor(partial: Partial<UserScoreEntity>) {
    Object.assign(this, partial);
  }
}
