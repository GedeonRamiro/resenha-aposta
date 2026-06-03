import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';
import { CreateGameDto } from './dtos/create-game.dto';
import { UpdateGameDto } from './dtos/update-game.dto';
import { ReturnGamePagination } from './interface/return-game-pagination';
import { Cron } from '@nestjs/schedule';
import { GameStatus, GameType, Prisma } from '@prisma/client';
import { createPagination } from 'src/utils/pagination';
import { parseDateFilter, parseDateTime } from 'src/utils/dataTimeFilter';
import {
  getKnockoutWinnerOptionForGame,
  resolveRegularScore,
} from './utils/game-score.utils';
import { mapGameResponse } from './utils/game-response.mapper';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getResult(home: number, away: number) {
    if (home > away) return 'HOME_WIN';
    if (home < away) return 'AWAY_WIN';
    return 'DRAW';
  }

  private async getTeamByIdOrFail(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Time não encontrado!');
    }

    return team;
  }

  private async getCompetitionByIdOrFail(competitionId: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });
    if (!competition) {
      throw new NotFoundException('Competição não encontrada!');
    }

    return competition;
  }

  private async settleGameBetsByOption(
    tx: Prisma.TransactionClient,
    gameId: string,
    option: 'HOME_WIN' | 'AWAY_WIN' | 'DRAW',
  ): Promise<void> {
    const now = new Date();

    await tx.$executeRaw`
      UPDATE "Bet"
      SET
        "isCorrect" = (CASE WHEN option = ${option}::"BetOption" THEN true ELSE false END),
        "pointsAwarded" = (CASE WHEN option = ${option}::"BetOption" THEN 1 ELSE 0 END),
        "settledAt" = ${now}
      WHERE "gameId" = ${gameId}
    `;
  }

  private async settleKnockoutBets(
    tx: Prisma.TransactionClient,
    game: {
      id: string;
      gameType: GameType;
      homeScore: number | null;
      awayScore: number | null;
      secondLegHomeScore: number | null;
      secondLegAwayScore: number | null;
      penaltyHomeScore: number | null;
      penaltyAwayScore: number | null;
    },
  ): Promise<void> {
    const option = getKnockoutWinnerOptionForGame(game);
    if (!option) {
      throw new BadRequestException(
        'No mata-mata, em caso de empate, informe os pênaltis para definir green/red.',
      );
    }

    await this.settleGameBetsByOption(tx, game.id, option);
  }

  private async settleGameBets(
    tx: Prisma.TransactionClient,
    gameId: string,
    homeScore: number,
    awayScore: number,
  ): Promise<void> {
    const result = this.getResult(homeScore, awayScore);
    await this.settleGameBetsByOption(tx, gameId, result);
  }

  async create(dto: CreateGameDto) {
    const config = await this.configService.get();
    const gameDate = parseDateTime(dto.gameDate, 'Data do jogo');
    const betCloseAt = new Date(
      gameDate.getTime() - config.betCloseMinutesBefore * 60 * 1000,
    );

    const gameType = dto.gameType ?? GameType.LEAGUE_GROUP;
    const isKnockoutGameType = String(gameType) === 'KNOCKOUT';

    await this.getTeamByIdOrFail(dto.homeTeamId);
    await this.getTeamByIdOrFail(dto.awayTeamId);
    await this.getCompetitionByIdOrFail(dto.competitionId);

    const createdGame = await this.prisma.game.create({
      data: {
        homeTeamId: dto.homeTeamId,
        awayTeamId: dto.awayTeamId,
        competitionId: dto.competitionId,
        gameDate,
        betCloseAt,
        gameType,
        homeScore: dto.homeScore,
        awayScore: dto.awayScore,
        secondLegHomeScore: isKnockoutGameType ? dto.secondLegHomeScore : null,
        secondLegAwayScore: isKnockoutGameType ? dto.secondLegAwayScore : null,
        moreInfo: dto.moreInfo,
      },
      include: {
        homeTeamRef: true,
        awayTeamRef: true,
        competitionRef: true,
      },
    });

    return mapGameResponse(createdGame);
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
      include: {
        homeTeamRef: true,
        awayTeamRef: true,
        competitionRef: true,
      },
    });

    const pagination = createPagination(limit, page, count);

    return {
      data: games.map((game) => mapGameResponse(game)),
      ...pagination,
    };
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        homeTeamRef: true,
        awayTeamRef: true,
        competitionRef: true,
        bets: {
          include: { user: true },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Jogo não encontrado!');
    }

    return mapGameResponse(game);
  }

  async update(id: string, dto: UpdateGameDto) {
    const currentGame = await this.findOne(id);

    const nextStatus = dto.status ?? currentGame.status;
    const resolvedGameType = dto.gameType ?? currentGame.gameType;
    const resolvedSecondLegHomeScore =
      dto.secondLegHomeScore ?? currentGame.secondLegHomeScore;
    const resolvedSecondLegAwayScore =
      dto.secondLegAwayScore ?? currentGame.secondLegAwayScore;

    const regularScore = resolveRegularScore({
      gameType: resolvedGameType,
      homeScore: dto.homeScore ?? currentGame.homeScore,
      awayScore: dto.awayScore ?? currentGame.awayScore,
      secondLegHomeScore: resolvedSecondLegHomeScore,
      secondLegAwayScore: resolvedSecondLegAwayScore,
    });

    if (nextStatus === GameStatus.FINISHED && !regularScore) {
      throw new BadRequestException(
        'Para finalizar o jogo, informe placar simples ou os placares de ida e volta de casa e visitante!',
      );
    }

    let resolvedHomeTeamId: string | undefined;
    let resolvedAwayTeamId: string | undefined;
    let resolvedCompetitionId: string | undefined;
    if (dto.homeTeamId) {
      const homeTeam = await this.getTeamByIdOrFail(dto.homeTeamId);
      resolvedHomeTeamId = homeTeam.id;
    }

    if (dto.awayTeamId) {
      const awayTeam = await this.getTeamByIdOrFail(dto.awayTeamId);
      resolvedAwayTeamId = awayTeam.id;
    }

    if (dto.competitionId) {
      const competition = await this.getCompetitionByIdOrFail(
        dto.competitionId,
      );
      resolvedCompetitionId = competition.id;
    }

    const resolvedPenaltyHomeScore =
      dto.penaltyHomeScore ?? currentGame.penaltyHomeScore;
    const resolvedPenaltyAwayScore =
      dto.penaltyAwayScore ?? currentGame.penaltyAwayScore;

    if (
      nextStatus === GameStatus.FINISHED &&
      resolvedGameType === GameType.KNOCKOUT &&
      regularScore &&
      regularScore.home === regularScore.away &&
      (resolvedPenaltyHomeScore === null ||
        resolvedPenaltyAwayScore === null ||
        resolvedPenaltyHomeScore === resolvedPenaltyAwayScore)
    ) {
      throw new BadRequestException(
        'No mata-mata empatado, informe pênaltis válidos para calcular green/red.',
      );
    }

    const hasRegularScore = !!regularScore;
    const isKnockoutDraw =
      resolvedGameType === GameType.KNOCKOUT &&
      hasRegularScore &&
      regularScore.home === regularScore.away;
    const hasValidPenaltiesForKnockoutDraw =
      resolvedPenaltyHomeScore !== null &&
      resolvedPenaltyAwayScore !== null &&
      resolvedPenaltyHomeScore !== resolvedPenaltyAwayScore;

    const requestedStatus = dto.status ?? currentGame.status;

    const shouldAutoFinish =
      requestedStatus !== GameStatus.FINISHED &&
      currentGame.status !== GameStatus.FINISHED &&
      hasRegularScore &&
      (!isKnockoutDraw || hasValidPenaltiesForKnockoutDraw);

    const data: Prisma.GameUncheckedUpdateInput = {
      gameDate: dto.gameDate
        ? parseDateTime(dto.gameDate, 'Data do jogo')
        : undefined,
      homeScore: dto.homeScore,
      awayScore: dto.awayScore,
      secondLegHomeScore:
        resolvedGameType === GameType.KNOCKOUT
          ? resolvedSecondLegHomeScore
          : null,
      secondLegAwayScore:
        resolvedGameType === GameType.KNOCKOUT
          ? resolvedSecondLegAwayScore
          : null,
      moreInfo: dto.moreInfo,
      gameType: resolvedGameType,
      status: shouldAutoFinish ? GameStatus.FINISHED : dto.status,
      penaltyHomeScore:
        resolvedGameType === GameType.KNOCKOUT ? dto.penaltyHomeScore : null,
      penaltyAwayScore:
        resolvedGameType === GameType.KNOCKOUT ? dto.penaltyAwayScore : null,
      homeTeamId: resolvedHomeTeamId,
      awayTeamId: resolvedAwayTeamId,
      competitionId: resolvedCompetitionId,
      betCloseAt: undefined,
    };

    if (dto.gameDate) {
      const config = await this.configService.get();
      const gameDate = parseDateTime(dto.gameDate, 'Data do jogo');
      data.betCloseAt = new Date(
        gameDate.getTime() - config.betCloseMinutesBefore * 60 * 1000,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedGame = await tx.game.update({
        where: { id },
        data,
        include: {
          homeTeamRef: true,
          awayTeamRef: true,
          competitionRef: true,
        },
      });

      const finalRegularScore = resolveRegularScore({
        gameType: updatedGame.gameType,
        homeScore: updatedGame.homeScore,
        awayScore: updatedGame.awayScore,
        secondLegHomeScore: updatedGame.secondLegHomeScore,
        secondLegAwayScore: updatedGame.secondLegAwayScore,
      });

      if (updatedGame.status === GameStatus.FINISHED && finalRegularScore) {
        if (updatedGame.gameType === GameType.KNOCKOUT) {
          await this.settleKnockoutBets(tx, updatedGame);
        } else {
          await this.settleGameBets(
            tx,
            updatedGame.id,
            finalRegularScore.home,
            finalRegularScore.away,
          );
        }
      }

      return mapGameResponse(updatedGame);
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
