import { Role } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(Role, {
    message: 'Perfil deve ser ADMIN, MODERATOR, PLAYER ou PENDING!',
  })
  role?: Role;
}
