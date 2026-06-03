import { IsDateString, IsString, MinLength } from 'class-validator';

export class RankingSeasonDto {
  @IsString({ message: 'Slug da temporada deve ser uma string!' })
  @MinLength(1, { message: 'Slug da temporada é obrigatório!' })
  slug: string;

  @IsString({ message: 'Nome da temporada deve ser uma string!' })
  @MinLength(1, { message: 'Nome da temporada é obrigatório!' })
  label: string;

  @IsDateString({}, { message: 'Data inicial da temporada deve ser válida!' })
  startDate: string;

  @IsDateString({}, { message: 'Data final da temporada deve ser válida!' })
  endDate: string;
}
