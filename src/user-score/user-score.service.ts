import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RankingItem } from './interface/ranking-item.interface';
import { parseDateFilter } from 'src/utils/dataTimeFilter';
import { GameType } from '@prisma/client';

@Injectable()
export class UserScoreService {
  constructor(private readonly prisma: PrismaService) {}

  private getResult(home: number, away: number) {
    if (home > away) return 'HOME_WIN';
    if (home < away) return 'AWAY_WIN';
    return 'DRAW';
  }

  private getGameResult(game: {
    gameType: GameType;
    homeScore: number | null;
    awayScore: number | null;
    secondLegHomeScore: number | null;
    secondLegAwayScore: number | null;
    penaltyHomeScore: number | null;
    penaltyAwayScore: number | null;
  }) {
    const hasSecondLegHome = game.secondLegHomeScore !== null;
    const hasSecondLegAway = game.secondLegAwayScore !== null;

    if (
      game.gameType === GameType.KNOCKOUT &&
      hasSecondLegHome !== hasSecondLegAway
    ) {
      return null;
    }

    const homeScore =
      game.gameType === GameType.KNOCKOUT && hasSecondLegHome
        ? game.homeScore !== null
          ? game.homeScore + (game.secondLegHomeScore as number)
          : null
        : game.homeScore;
    const awayScore =
      game.gameType === GameType.KNOCKOUT && hasSecondLegAway
        ? game.awayScore !== null
          ? game.awayScore + (game.secondLegAwayScore as number)
          : null
        : game.awayScore;

    if (homeScore === null || awayScore === null) {
      return null;
    }

    if (homeScore > awayScore) return 'HOME_WIN';
    if (homeScore < awayScore) return 'AWAY_WIN';

    if (
      game.gameType === GameType.KNOCKOUT &&
      game.penaltyHomeScore !== null &&
      game.penaltyAwayScore !== null &&
      game.penaltyHomeScore !== game.penaltyAwayScore
    ) {
      return game.penaltyHomeScore > game.penaltyAwayScore
        ? 'HOME_WIN'
        : 'AWAY_WIN';
    }

    return 'DRAW';
  }

  async findAll(startDate?: string, endDate?: string): Promise<RankingItem[]> {
    const dateFilter = {
      gte: startDate ? parseDateFilter(startDate, 'start') : undefined,
      lt: endDate ? parseDateFilter(endDate, 'end') : undefined,
    };

    const games = await this.prisma.game.findMany({
      where: {
        status: 'FINISHED',
        gameDate: {
          ...dateFilter,
        },
      },
      include: {
        bets: {
          include: {
            user: true,
          },
        },
      },
    });

    const ranking: Record<string, RankingItem> = {};

    for (const game of games) {
      const result = this.getGameResult(game);

      if (!result) {
        continue;
      }

      for (const bet of game.bets) {
        if (!ranking[bet.userId]) {
          ranking[bet.userId] = {
            user: bet.user,
            points: 0,
            bets: 0,
          };
        }

        ranking[bet.userId].bets += 1;

        if (bet.settledAt) {
          ranking[bet.userId].points += bet.pointsAwarded;
          continue;
        }

        // Backward compatibility for games that were finished before settlement fields existed.
        if (bet.option === result) {
          ranking[bet.userId].points += 1;
        }
      }
    }

    return Object.values(ranking).sort((a, b) => b.points - a.points);
  }

  async findOne(userId: string): Promise<RankingItem> {
    const ranking = await this.findAll();

    const user = ranking.find((r) => r.user && r.user.id === userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado no ranking');
    }

    return user;
  }

  async findByUser(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<RankingItem> {
    const ranking = await this.findAll(startDate, endDate);

    const user = ranking.find((r) => r.user && r.user.id === userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado no ranking');
    }

    return user;
  }
}
