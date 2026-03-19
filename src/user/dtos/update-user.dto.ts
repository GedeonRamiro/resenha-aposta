import { IsEmail, MinLength } from 'class-validator';

export class UpdateUserDto {
  @MinLength(3, { message: 'Nome muito curto!' })
  name: string;

  @IsEmail(undefined, { message: 'Formato de e-mail digitado não é valido!' })
  email: string;
}
