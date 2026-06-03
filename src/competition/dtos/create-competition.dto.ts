import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateCompetitionDto {
  @IsString({ message: 'Nome da competição deve ser uma string!' })
  @MinLength(2, {
    message: 'Nome da competição deve ter ao menos 2 caracteres!',
  })
  name: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo da competição deve ser uma URL válida!' })
  logoUrl?: string;
}
