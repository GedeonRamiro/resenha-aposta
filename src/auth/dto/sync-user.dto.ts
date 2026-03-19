import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SyncUserDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  name?: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Imagem deve ser uma string' })
  image?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerId?: string;
}
