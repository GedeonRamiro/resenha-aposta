import { PartialType } from '@nestjs/mapped-types';
import { CreateUserScoreDto } from './create-user-score.dto';

export class UpdateUserScoreDto extends PartialType(CreateUserScoreDto) {}
