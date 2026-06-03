export class ReturnGameDto {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  competition: string | null;
  gameDate: Date;
  betCloseAt: Date;
  moreInfo: string | null;
  status: string;
  gameType: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  competitionId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  secondLegHomeScore: number | null;
  secondLegAwayScore: number | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}
