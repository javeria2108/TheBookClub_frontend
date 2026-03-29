const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export type Club = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type GetClubsResponse = {
  clubs: Club[];
  pagination: Pagination;
};

type GetClubsParams = {
  page?: number;
  limit?: number;
  search?: string;
  isPublic?: boolean;
};

export async function getClubs(params: GetClubsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (typeof params.isPublic === "boolean") {
    query.set("isPublic", String(params.isPublic));
  }

  const url = `${API_BASE_URL}/clubs${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || "Failed to fetch clubs";
    throw new Error(message);
  }

  return payload.data as GetClubsResponse;
}
