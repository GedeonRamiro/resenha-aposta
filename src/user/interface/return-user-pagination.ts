import { ReturnUserDto } from '../dtos/return-user.dto';

export interface ReturnUserPagination {
  data: ReturnUserDto[];
  count: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
}
