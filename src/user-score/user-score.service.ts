import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RankingItem } from './interface/ranking-item.interface';

@Injectable()
export class UserScoreService {
  constructor(private readonly prisma: PrismaService) {}

  private getResult(home: number, away: number) {
    if (home > away) return 'HOME_WIN';
    if (home < away) return 'AWAY_WIN';
    return 'DRAW';
  }

  async findAll(startDate?: string, endDate?: string): Promise<RankingItem[]> {
    const games = await this.prisma.game.findMany({
      where: {
        status: 'FINISHED',
        gameDate: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
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
      const result = this.getResult(game.homeScore!, game.awayScore!);

      for (const bet of game.bets) {
        if (!ranking[bet.userId]) {
          ranking[bet.userId] = {
            user: bet.user,
            points: 0,
            bets: 0,
          };
        }

        ranking[bet.userId].bets += 1;

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
