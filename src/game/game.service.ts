import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dtos/create-game.dto';
import { UpdateGameDto } from './dtos/update-game.dto';
import { ReturnGamePagination } from './interface/return-game-pagination';
import { Cron } from '@nestjs/schedule';
import { GameStatus } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGameDto) {
    return this.prisma.game.create({
      data: {
        homeTeam: dto.homeTeam,
        awayTeam: dto.awayTeam,
        gameDate: new Date(dto.gameDate),
        betCloseAt: new Date(dto.betCloseAt),
      },
    });
  }

  async getAll(
    limit: number,
    page: number,
    startDate?: string,
    endDate?: string,
  ): Promise<ReturnGamePagination> {
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

    const count = await this.prisma.game.count({ where });

    const games = await this.prisma.game.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    const lastPage = Math.ceil(count / limit);

    return {
      data: games,
      count,
      currentPage: page,
      nextPage: page < lastPage ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      lastPage,
    };
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        bets: {
          include: { user: true },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Jogo não encontrado');
    }

    return game;
  }

  async update(id: string, dto: UpdateGameDto) {
    await this.findOne(id);

    const data = {
      ...dto,
      gameDate: dto.gameDate ? new Date(dto.gameDate) : undefined,
      betCloseAt: dto.betCloseAt ? new Date(dto.betCloseAt) : undefined,
    };

    return this.prisma.game.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.game.delete({
      where: { id },
    });
  }

  @Cron('*/1 * * * *') // roda a cada 1 minutos
  async closeExpiredBets() {
    const now = new Date();

    await this.prisma.game.updateMany({
      where: {
        status: GameStatus.SCHEDULED,
        betCloseAt: {
          lte: now,
        },
      },
      data: {
        status: GameStatus.CLOSED,
      },
    });
  }
}
