import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBetDto } from './dtos/create-bet.dto';
import { UpdateBetDto } from './dtos/update-bet.dto';
import { ReturnBetPagination } from './interface/return-bet-pagination';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class BetService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDateTime(value: string, fieldName: string): Date {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${fieldName} inválida`);
    }

    return parsed;
  }

  private parseDateFilter(value: string, bound: 'start' | 'end'): Date {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (isDateOnly) {
      const [year, month, day] = value.split('-').map(Number);
      const utcDate = new Date(Date.UTC(year, month - 1, day));

      if (bound === 'end') {
        utcDate.setUTCDate(utcDate.getUTCDate() + 1);
      }

      return utcDate;
    }

    return this.parseDateTime(value, 'Data de filtro');
  }

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
            gte: startDate
              ? this.parseDateFilter(startDate, 'start')
              : undefined,
            lt: endDate ? this.parseDateFilter(endDate, 'end') : undefined,
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

    const start = startDate
      ? this.parseDateFilter(startDate, 'start')
      : undefined;
    const end = endDate ? this.parseDateFilter(endDate, 'end') : undefined;

    const gameWhere: Prisma.GameWhereInput = {
      ...(startDate || endDate
        ? {
            gameDate: {
              gte: start,
              lt: end,
            },
          }
        : {}),
      bets: {
        some: {},
      },
    };

    const count = await this.prisma.game.count({ where: gameWhere });

    const games = await this.prisma.game.findMany({
      where: gameWhere,
      select: { id: true },
      take: limit,
      skip,
      orderBy: [{ gameDate: 'desc' }, { createdAt: 'desc' }],
    });

    const gameIds = games.map((game) => game.id);

    if (gameIds.length === 0) {
      const lastPage = Math.ceil(count / limit);

      return {
        data: [],
        count,
        currentPage: page,
        nextPage: page < lastPage ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        lastPage,
      };
    }

    const bets = await this.prisma.bet.findMany({
      where: {
        gameId: {
          in: gameIds,
        },
      },
      include: { game: true, user: true },
      orderBy: [{ createdAt: 'desc' }],
    });

    const gameOrder = new Map(gameIds.map((id, index) => [id, index]));

    bets.sort((a, b) => {
      const aGameOrder = gameOrder.get(a.gameId) ?? Number.MAX_SAFE_INTEGER;
      const bGameOrder = gameOrder.get(b.gameId) ?? Number.MAX_SAFE_INTEGER;

      if (aGameOrder !== bGameOrder) {
        return aGameOrder - bGameOrder;
      }

      return b.createdAt.getTime() - a.createdAt.getTime();
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

  async update(id: string, updateBetDto: UpdateBetDto, requester: User) {
    const currentBet = await this.findOne(id);

    if (currentBet.game.status !== 'SCHEDULED') {
      throw new BadRequestException('Mercado fechado!');
    }

    if (requester.role !== 'ADMIN' && currentBet.userId !== requester.id) {
      throw new ForbiddenException('Você só pode editar sua própria aposta!');
    }

    return this.prisma.bet.update({
      where: { id },
      data: { option: updateBetDto.option },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.bet.delete({
      where: { id },
    });
  }
}
