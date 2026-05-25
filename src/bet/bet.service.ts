import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBetDto } from './dtos/create-bet.dto';
import { UpdateBetDto } from './dtos/update-bet.dto';
import { ReturnBetPagination } from './interface/return-bet-pagination';
import { Prisma, User } from '@prisma/client';
import { createPagination } from 'src/utils/pagination';
import { parseDateFilter } from 'src/utils/dataTimeFilter';

@Injectable()
export class BetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBetDto: CreateBetDto & { userId: string }) {
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
      throw new BadRequestException('Mercado fechado!');
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
            gte: startDate ? parseDateFilter(startDate, 'start') : undefined,
            lt: endDate ? parseDateFilter(endDate, 'end') : undefined,
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
    if (isNaN(limit) || isNaN(page)) {
      throw new NotAcceptableException('Página ou limite formato inválido!');
    }

    const skip = (page - 1) * limit;

    const start = startDate ? parseDateFilter(startDate, 'start') : undefined;
    const end = endDate ? parseDateFilter(endDate, 'end') : undefined;

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
    const totalBets = await this.prisma.bet.count({
      where: { game: gameWhere },
    });

    const games = await this.prisma.game.findMany({
      where: gameWhere,
      select: { id: true },
      take: limit,
      skip,
      orderBy: [{ gameDate: 'desc' }, { createdAt: 'desc' }],
    });

    const gameIds = games.map((game) => game.id);
    const pagination = createPagination(limit, page, count);

    if (gameIds.length === 0) {
      return {
        data: [],
        totalBets,
        ...pagination,
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

    return {
      data: bets,
      totalBets,
      ...pagination,
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
      data: {
        option: updateBetDto.option,
        lastEditedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.bet.delete({
      where: { id },
    });
  }
}
