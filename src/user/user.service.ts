import {
  Injectable,
  NotFoundException,
  NotAcceptableException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ReturnUserPagination } from './interface/return-user-pagination';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: createUserDto,
    });
  }

  async getAll(limit: number, page: number): Promise<ReturnUserPagination> {
    if (isNaN(Number(page)) || isNaN(Number(limit))) {
      throw new NotAcceptableException('Página ou limite formato inválido!');
    }

    const skip = (page - 1) * limit;

    const count = await this.prisma.user.count();

    const users = await this.prisma.user.findMany({
      take: limit,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        bets: {
          include: {
            game: true,
          },
        },
      },
    });

    const lastPage = Math.ceil(count / limit);

    return {
      data: users,
      count,
      currentPage: page,
      nextPage: page < lastPage ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      lastPage,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        bets: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            game: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    if (!updateUserDto.role) {
      throw new BadRequestException('Informe o perfil para atualizar!');
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        role: updateUserDto.role,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.$transaction(async (tx) => {
      await tx.bet.deleteMany({
        where: { userId: id },
      });

      return tx.user.delete({
        where: { id },
      });
    });
  }

  async existEmail(email: string, excludeId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.id !== excludeId) {
      throw new ConflictException('Email já cadastrado!');
    }

    return true;
  }
}
