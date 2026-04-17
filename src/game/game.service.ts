import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dtos/create-game.dto';
import { UpdateGameDto } from './dtos/update-game.dto';
import { ReturnGamePagination } from './interface/return-game-pagination';
import { Cron } from '@nestjs/schedule';
import { GameStatus, Prisma } from '@prisma/client';
import { createPagination } from 'src/utils/pagination';
import { parseDateFilter, parseDateTime } from 'src/utils/dataTimeFilter';

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

    // Use raw SQL to update bets without triggering updatedAt auto-update
    await tx.$executeRaw`
      UPDATE "Bet"
      SET
        "isCorrect" = (CASE WHEN option = ${result}::"BetOption" THEN true ELSE false END),
        "pointsAwarded" = (CASE WHEN option = ${result}::"BetOption" THEN 1 ELSE 0 END),
        "settledAt" = ${now}
      WHERE "gameId" = ${gameId}
    `;
  }

  async create(dto: CreateGameDto) {
    return this.prisma.game.create({
      data: {
        homeTeam: dto.homeTeam,
        awayTeam: dto.awayTeam,
        homeTeamLogo: dto.homeTeamLogo,
        awayTeamLogo: dto.awayTeamLogo,
        competition: dto.competition,
        gameDate: parseDateTime(dto.gameDate, 'Data do jogo'),
        betCloseAt: parseDateTime(dto.betCloseAt, 'Data de fechamento'),
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
    if (isNaN(limit) || isNaN(page)) {
      throw new NotAcceptableException('Página ou limite formato inválido!');
    }

    const skip = (page - 1) * limit;

    const start = startDate ? parseDateFilter(startDate, 'start') : undefined;
    const end = endDate ? parseDateFilter(endDate, 'end') : undefined;

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

    const pagination = createPagination(limit, page, count);

    return {
      data: games,
      ...pagination,
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
      throw new NotFoundException('Jogo não encontrado!');
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
        'Para finalizar o jogo, informe o placar de casa e o placar de fora!',
      );
    }

    const data = {
      ...dto,
      gameDate: dto.gameDate
        ? parseDateTime(dto.gameDate, 'Data do jogo')
        : undefined,
      betCloseAt: dto.betCloseAt
        ? parseDateTime(dto.betCloseAt, 'Data de fechamento')
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
