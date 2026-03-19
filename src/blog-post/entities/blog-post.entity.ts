import { ReturnBlogPostDto } from '../dtos/return-blog-post.dto';

export class BlogPostEntity implements ReturnBlogPostDto {
  id!: string;
  title!: string;
  slug!: string;
  content!: string;
  published!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<BlogPostEntity>) {
    Object.assign(this, partial);
  }
}
