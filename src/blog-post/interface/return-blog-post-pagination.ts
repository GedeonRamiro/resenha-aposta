import { ReturnBlogPostDto } from '../dtos/return-blog-post.dto';

export interface ReturnBlogPostPagination {
  data: ReturnBlogPostDto[];
  count: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
}
