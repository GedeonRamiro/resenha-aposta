import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type BlogPost } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dtos/create-blog-post.dto';
import { UpdateBlogPostDto } from './dtos/update-blog-post.dto';
import { ReturnBlogPostPagination } from './interface/return-blog-post-pagination';
import slugify from 'slugify';

@Injectable()
export class BlogPostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBlogPostDto): Promise<BlogPost> {
    const slug = slugify(dto.title, {
      lower: true,
      strict: true,
      locale: 'pt',
    });

    return await this.prisma.blogPost.create({
      data: {
        ...dto,
        slug,
      },
    });
  }

  async getAll(
    limit: number,
    page: number,
    query?: string,
  ): Promise<ReturnBlogPostPagination> {
    const skip = (page - 1) * limit;

    const where = query
      ? {
          OR: [
            {
              title: {
                contains: query,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              content: {
                contains: query,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const count = await this.prisma.blogPost.count({
      where,
    });

    const posts = await this.prisma.blogPost.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    const lastPage = Math.ceil(count / limit);

    return {
      data: posts,
      count,
      currentPage: page,
      nextPage: page < lastPage ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      lastPage,
    };
  }

  async findOne(id: string): Promise<BlogPost> {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Blog post não encontrado!');
    }

    return post;
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      throw new NotFoundException('Blog post não encontrado!');
    }

    return post;
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const post = await this.findOne(id);

    const slug = slugify(dto.title ? dto.title : post.title, {
      lower: true,
      strict: true,
      locale: 'pt',
    });

    const updated = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...dto,
        slug,
      },
    });

    return updated;
  }

  async remove(id: string): Promise<BlogPost> {
    await this.findOne(id);

    const deleted = await this.prisma.blogPost.delete({
      where: { id },
    });

    return deleted;
  }
}
