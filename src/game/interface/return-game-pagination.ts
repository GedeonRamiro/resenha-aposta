import { ReturnGameDto } from '../dtos/return-game.dto';

export interface ReturnGamePagination {
  data: ReturnGameDto[];
  count: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
}
