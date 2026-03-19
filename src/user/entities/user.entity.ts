import { ReturnUserDto } from '../dtos/return-user.dto';

export class UserEntity implements ReturnUserDto {
  id!: string;
  name!: string;
  email!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
