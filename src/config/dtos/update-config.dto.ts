import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { RankingSeasonDto } from './ranking-season.dto';

export class UpdateConfigDto {
  @IsInt({ message: 'Minutos de fechamento deve ser um número inteiro!' })
  @Min(1, { message: 'Minutos de fechamento deve ser no mínimo 1!' })
  betCloseMinutesBefore: number;

  @IsArray({ message: 'Temporadas do ranking deve ser uma lista!' })
  @ValidateNested({ each: true })
  @Type(() => RankingSeasonDto)
  rankingSeasons: RankingSeasonDto[];
}
