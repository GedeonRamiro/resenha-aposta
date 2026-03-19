export class ReturnGameDto {
  id: string;
  homeTeam: string;
  awayTeam: string;
  gameDate: Date;
  betCloseAt: Date;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}
