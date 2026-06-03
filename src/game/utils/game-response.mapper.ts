import { Prisma } from '@prisma/client';

export type GameWithRelations = Prisma.GameGetPayload<{
  include: {
    homeTeamRef: true;
    awayTeamRef: true;
    competitionRef: true;
  };
}>;

export type GameWithRelationsAndBets = Prisma.GameGetPayload<{
  include: {
    homeTeamRef: true;
    awayTeamRef: true;
    competitionRef: true;
    bets: {
      include: {
        user: true;
      };
    };
  };
}>;

export function mapGameResponse(
  game: GameWithRelations | GameWithRelationsAndBets,
) {
  const { homeTeamRef, awayTeamRef, competitionRef, ...rest } = game;

  return {
    ...rest,
    homeTeam: homeTeamRef?.name ?? '',
    awayTeam: awayTeamRef?.name ?? '',
    homeTeamLogo: homeTeamRef?.logoUrl ?? null,
    awayTeamLogo: awayTeamRef?.logoUrl ?? null,
    competition: competitionRef?.name ?? null,
  };
}
