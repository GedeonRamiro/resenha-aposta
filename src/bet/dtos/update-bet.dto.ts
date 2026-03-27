import { PickType } from '@nestjs/mapped-types';
import { CreateBetDto } from './create-bet.dto';

export class UpdateBetDto extends PickType(CreateBetDto, ['option'] as const) {}
