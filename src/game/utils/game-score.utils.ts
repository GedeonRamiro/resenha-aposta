import { BadRequestException } from '@nestjs/common';
import { GameType } from '@prisma/client';

export type RegularScoreInput = {
  gameType: GameType;
  homeScore: number | null | undefined;
  awayScore: number | null | undefined;
  secondLegHomeScore: number | null | undefined;
  secondLegAwayScore: number | null | undefined;
};

export function resolveRegularScore(
  input: RegularScoreInput,
): { home: number; away: number } | null {
  if (input.gameType === GameType.KNOCKOUT) {
    const hasSecondLegHome =
      input.secondLegHomeScore !== null &&
      input.secondLegHomeScore !== undefined;
    const hasSecondLegAway =
      input.secondLegAwayScore !== null &&
      input.secondLegAwayScore !== undefined;

    if (hasSecondLegHome || hasSecondLegAway) {
      if (!hasSecondLegHome || !hasSecondLegAway) {
        throw new BadRequestException(
          'No mata-mata, informe placar da volta da casa e do visitante.',
        );
      }

      if (
        input.homeScore === null ||
        input.homeScore === undefined ||
        input.awayScore === null ||
        input.awayScore === undefined
      ) {
        throw new BadRequestException(
          'No mata-mata com ida e volta, informe placar da ida da casa e do visitante.',
        );
      }

      return {
        home: input.homeScore + (input.secondLegHomeScore as number),
        away: input.awayScore + (input.secondLegAwayScore as number),
      };
    }
  }

  if (input.homeScore === null || input.homeScore === undefined) {
    return null;
  }

  if (input.awayScore === null || input.awayScore === undefined) {
    return null;
  }

  return {
    home: input.homeScore,
    away: input.awayScore,
  };
}

export function getKnockoutWinnerOptionForGame(game: {
  gameType: GameType;
  homeScore: number | null;
  awayScore: number | null;
  secondLegHomeScore: number | null;
  secondLegAwayScore: number | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
}): 'HOME_WIN' | 'AWAY_WIN' | null {
  const regularScore = resolveRegularScore(game);

  if (!regularScore) {
    return null;
  }

  if (regularScore.home > regularScore.away) {
    return 'HOME_WIN';
  }

  if (regularScore.away > regularScore.home) {
    return 'AWAY_WIN';
  }

  if (
    game.penaltyHomeScore === null ||
    game.penaltyAwayScore === null ||
    game.penaltyHomeScore === game.penaltyAwayScore
  ) {
    return null;
  }

  return game.penaltyHomeScore > game.penaltyAwayScore
    ? 'HOME_WIN'
    : 'AWAY_WIN';
}
