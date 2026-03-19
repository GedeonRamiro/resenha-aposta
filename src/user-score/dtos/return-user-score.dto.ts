import { ReturnUserDto } from '../../user/dtos/return-user.dto';

export class ReturnUserScoreDto {
  id: string;
  userId: string;
  points: number;
  updatedAt: Date;
  user?: ReturnUserDto;
}
