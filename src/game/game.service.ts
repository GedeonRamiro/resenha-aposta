import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dtos/create-game.dto';
import { UpdateGameDto } from './dtos/update-game.dto';
import { ReturnGamePagination } from './interface/return-game-pagination';
import { Cron } from '@nestjs/schedule';
import { GameStatus, Prisma } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  private getResult(home: number, away: number) {
    if (home > away) return 'HOME_WIN';
    if (home < away) return 'AWAY_WIN';
    return 'DRAW';
  }

  private async settleGameBets(
    tx: Prisma.TransactionClient,
    gameId: string,
    homeScore: number,
    awayScore: number,
  ): Promise<void> {
    const result = this.getResult(homeScore, awayScore);
    const now = new Date();

    const bets = await tx.bet.findMany({
      where: { gameId },
      select: {
        id: true,
        option: true,
      },
    });

    await Promise.all(
      bets.map((bet) => {
        const isCorrect = bet.option === result;

        return tx.bet.update({
          where: { id: bet.id },
          data: {
            isCorrect,
            pointsAwarded: isCorrect ? 1 : 0,
            settledAt: now,
          },
        });
      }),
    );
  }

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

  async create(dto: CreateGameDto) {
    return this.prisma.game.create({
      data: {
        homeTeam: dto.homeTeam,
        awayTeam: dto.awayTeam,
        competition: dto.competition,
        gameDate: this.parseDateTime(dto.gameDate, 'Data do jogo'),
        betCloseAt: this.parseDateTime(dto.betCloseAt, 'Data de fechamento'),
        moreInfo: dto.moreInfo,
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

    const start = startDate
      ? this.parseDateFilter(startDate, 'start')
      : undefined;
    const end = endDate ? this.parseDateFilter(endDate, 'end') : undefined;

    const where =
      startDate || endDate
        ? {
            gameDate: {
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
      orderBy: [{ createdAt: 'desc' }, { gameDate: 'desc' }],
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
    const currentGame = await this.findOne(id);

    const nextStatus = dto.status ?? currentGame.status;
    const nextHomeScore = dto.homeScore ?? currentGame.homeScore;
    const nextAwayScore = dto.awayScore ?? currentGame.awayScore;

    if (
      nextStatus === GameStatus.FINISHED &&
      (nextHomeScore === null ||
        nextHomeScore === undefined ||
        nextAwayScore === null ||
        nextAwayScore === undefined)
    ) {
      throw new BadRequestException(
        'Para finalizar o jogo, informe homeScore e awayScore.',
      );
    }

    const data = {
      ...dto,
      gameDate: dto.gameDate
        ? this.parseDateTime(dto.gameDate, 'Data do jogo')
        : undefined,
      betCloseAt: dto.betCloseAt
        ? this.parseDateTime(dto.betCloseAt, 'Data de fechamento')
        : undefined,
    };

    return this.prisma.$transaction(async (tx) => {
      const updatedGame = await tx.game.update({
        where: { id },
        data,
      });

      if (
        updatedGame.status === GameStatus.FINISHED &&
        updatedGame.homeScore !== null &&
        updatedGame.awayScore !== null
      ) {
        await this.settleGameBets(
          tx,
          updatedGame.id,
          updatedGame.homeScore,
          updatedGame.awayScore,
        );
      }

      return updatedGame;
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.bet.deleteMany({
        where: { gameId: id },
      });

      return tx.game.delete({
        where: { id },
      });
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
