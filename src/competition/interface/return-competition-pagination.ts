type CompetitionListItem = {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface ReturnCompetitionPagination {
  data: CompetitionListItem[];
  count: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
}
