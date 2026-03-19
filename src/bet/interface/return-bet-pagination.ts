import { ReturnBetDto } from '../dtos/return-bet.dto';

export interface ReturnBetPagination {
  data: ReturnBetDto[];
  count: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
}
