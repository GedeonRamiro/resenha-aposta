import { IsString, IsInt, Min } from 'class-validator';

export class CreateUserScoreDto {
  @IsString({ message: 'ID do usuário deve ser uma string!' })
  userId: string;

  @IsInt({ message: 'Pontos deve ser um número inteiro!' })
  @Min(0, { message: 'Pontos não pode ser negativo!' })
  points: number;
}
