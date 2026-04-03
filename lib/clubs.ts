const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
import {
  GetClubsParamsSchema,
  GetClubsResponseSchema,
} from "@/lib/contracts/club.contract";
import { GetClubsParams, GetClubsResponse } from "@/lib/types";

export async function getClubs(params: GetClubsParams = {}) {
  const validatedParams = GetClubsParamsSchema.parse(params);

  const query = new URLSearchParams();
  if (validatedParams.page) query.set("page", String(validatedParams.page));
  if (validatedParams.limit) query.set("limit", String(validatedParams.limit));
  if (validatedParams.search?.trim()) query.set("search", validatedParams.search.trim());
  if (typeof validatedParams.isPublic === "boolean") {
    query.set("isPublic", String(validatedParams.isPublic));
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

  return GetClubsResponseSchema.parse(payload.data) as GetClubsResponse;
}
