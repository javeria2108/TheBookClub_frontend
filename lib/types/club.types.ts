export type Club = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetClubsResponse = {
  clubs: Club[];
  pagination: Pagination;
};

export type GetClubsParams = {
  page?: number;
  limit?: number;
  search?: string;
  isPublic?: boolean;
};
