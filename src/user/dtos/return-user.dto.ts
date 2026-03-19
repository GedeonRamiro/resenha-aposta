import { ReturnBetDto } from '../../bet/dtos/return-bet.dto';

export class ReturnUserDto {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  provider?: string | null;
  providerId?: string | null;
  role: string;
  bets?: ReturnBetDto[];
  createdAt: Date;
  updatedAt: Date;
}
