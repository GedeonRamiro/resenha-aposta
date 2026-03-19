import { ReturnUserDto } from '../dtos/return-user.dto';

export class UserEntity implements ReturnUserDto {
  id!: string;
  name?: string | null;
  email!: string;
  image?: string | null;
  provider?: string | null;
  providerId?: string | null;
  role!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
