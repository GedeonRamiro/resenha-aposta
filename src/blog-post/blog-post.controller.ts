import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BlogPostService } from './blog-post.service';
import { CreateBlogPostDto } from './dtos/create-blog-post.dto';
import { UpdateBlogPostDto } from './dtos/update-blog-post.dto';
import { Environment } from '../enums/role.Environment';

@Controller('blog-posts')
export class BlogPostController {
  constructor(private readonly blogPostService: BlogPostService) {}

  @Post()
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogPostService.create(dto);
  }

  @Get()
  findAll(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('query') query?: string,
  ) {
    const limitNum = limit ? Number(limit) : Environment.LINE_LIMIT;
    const pageNum = page ? Number(page) : Environment.CURRENT_PAGE;

    return this.blogPostService.getAll(limitNum, pageNum, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogPostService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogPostService.findBySlug(slug);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogPostService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogPostService.remove(id);
  }
}
