import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateTeamDto {
  @IsString({ message: 'Nome do time deve ser uma string!' })
  @MinLength(2, { message: 'Nome do time deve ter ao menos 2 caracteres!' })
  name: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo do time deve ser uma URL válida!' })
  logoUrl?: string;
}
