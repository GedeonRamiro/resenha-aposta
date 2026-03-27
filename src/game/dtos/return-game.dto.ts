export class ReturnGameDto {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string | null;
  gameDate: Date;
  betCloseAt: Date;
  moreInfo: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}
