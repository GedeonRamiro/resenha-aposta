import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBetDto } from './dtos/create-bet.dto';
import { UpdateBetDto } from './dtos/update-bet.dto';
import { ReturnBetPagination } from './interface/return-bet-pagination';

@Injectable()
export class BetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBetDto: CreateBetDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createBetDto.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    const game = await this.prisma.game.findUnique({
      where: { id: createBetDto.gameId },
    });

    if (!game) {
      throw new NotFoundException('Jogo não encontrado!');
    }

    if (game.status !== 'SCHEDULED') {
      throw new NotFoundException('Mercado fechado!');
    }

    const existingBet = await this.prisma.bet.findUnique({
      where: {
        userId_gameId: {
          userId: createBetDto.userId,
          gameId: createBetDto.gameId,
        },
      },
    });

    if (existingBet) {
      throw new BadRequestException('Usuário já apostou neste jogo!');
    }

    return await this.prisma.bet.create({
      data: createBetDto,
    });
  }

  async findAll(startDate?: string, endDate?: string) {
    return await this.prisma.bet.findMany({
      where: {
        game: {
          gameDate: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          },
        },
      },
      include: {
        game: true,
        user: true,
      },
    });
  }

  async getAll(
    limit: number,
    page: number,
    startDate?: string,
    endDate?: string,
  ): Promise<ReturnBetPagination> {
    const skip = (page - 1) * limit;

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (end) {
      end.setDate(end.getDate() + 1);
    }

    const where =
      startDate || endDate
        ? {
            createdAt: {
              gte: start,
              lt: end,
            },
          }
        : {};

    const count = await this.prisma.bet.count({ where });

    const bets = await this.prisma.bet.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
      include: { game: true, user: true },
    });

    const lastPage = Math.ceil(count / limit);

    return {
      data: bets,
      count,
      currentPage: page,
      nextPage: page < lastPage ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      lastPage,
    };
  }

  async findOne(id: string) {
    const bet = await this.prisma.bet.findUnique({
      where: { id },
      include: {
        game: true,
        user: true,
      },
    });

    if (!bet) {
      throw new NotFoundException('Aposta não encontrada!');
    }

    return bet;
  }

  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    return await this.prisma.bet.findMany({
      where: { userId },
    });
  }

  async findByGame(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Jogo não encontrado!');
    }

    return await this.prisma.bet.findMany({
      where: { gameId },
    });
  }

  async update(id: string, updateBetDto: UpdateBetDto) {
    const bet = await this.findOne(id);

    if (bet.game.status !== 'SCHEDULED') {
      throw new NotFoundException('Mercado fechado!');
    }

    return await this.prisma.bet.update({
      where: { id },
      data: updateBetDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.bet.delete({
      where: { id },
    });
  }
}
