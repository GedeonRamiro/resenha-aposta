type TeamListItem = {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface ReturnTeamPagination {
  data: TeamListItem[];
  count: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
}
