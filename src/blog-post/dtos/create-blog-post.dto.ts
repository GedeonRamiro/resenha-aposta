import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBlogPostDto {
  @IsString({ message: 'Título deve ser uma string!' })
  @MinLength(3, { message: 'Título muito curto!' })
  title: string;

  @IsString({ message: 'Conteúdo deve ser uma string!' })
  @MinLength(10, { message: 'Conteúdo muito curto!' })
  content: string;

  @IsOptional()
  @IsBoolean({ message: 'Publicado deve ser verdadeiro ou falso!' })
  published?: boolean;
}
