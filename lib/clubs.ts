const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

import {
  GetClubsParamsSchema,
  GetClubsResponseSchema,
  CreateClubPayloadSchema,
  CreateClubResponseSchema,
  GetClubByIdResponseSchema,
  JoinClubResponseSchema,
} from "@/lib/contracts/club.contract";
import {
  GetClubsParams,
  GetClubsResponse,
  CreateClubPayload,
  CreateClubResponse,
  GetClubByIdResponse,
  JoinClubResponse,
} from "@/lib/types";
import { getStoredToken } from "./auth";

export async function getClubs(params: GetClubsParams = {}) {
  const validatedParams = GetClubsParamsSchema.parse(params);

  const query = new URLSearchParams();

  if (validatedParams.page) query.set("page", String(validatedParams.page));

  if (validatedParams.limit) query.set("limit", String(validatedParams.limit));

  if (validatedParams.search?.trim())
    query.set("search", validatedParams.search.trim());

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

export async function createClub(
  input: CreateClubPayload,
): Promise<CreateClubResponse> {
  const payload = CreateClubPayloadSchema.parse(input);

  const response = await fetch(`${API_BASE_URL}/clubs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok) {
    const message =
      body?.error?.message || body?.message || "Failed to create club";
    throw new Error(message);
  }

  return CreateClubResponseSchema.parse(body.data) as CreateClubResponse;
}

export async function getClubById(id: string) {
  if (!id?.trim()) {
    throw new Error("Club ID is required");
  }

  const url = `${API_BASE_URL}/clubs/${id}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || "Failed to fetch club";
    throw new Error(message);
  }

  return GetClubByIdResponseSchema.parse(payload.data) as GetClubByIdResponse;
}

export async function getMyClubs() {
  const url = `${API_BASE_URL}/users/me/clubs`;

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to view your clubs");
  }

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      "Failed to fetch your clubs";
    throw new Error(message);
  }

  // Expect payload.data = { clubs: Club[] }
  const clubs = payload?.data?.clubs ?? [];

  const result = {
    clubs,
    pagination: {
      page: 1,
      limit: clubs.length,
      total: clubs.length,
      totalPages: 1,
    },
  };

  return GetClubsResponseSchema.parse(result) as GetClubsResponse;
}

export async function joinClub(clubId: string): Promise<JoinClubResponse> {
  if (!clubId?.trim()) {
    throw new Error("Club ID is required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to join a club");
  }

  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/join`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || "Failed to join club";
    throw new Error(message);
  }

  return JoinClubResponseSchema.parse(payload.data) as JoinClubResponse;
}

export async function leaveClub(clubId: string): Promise<JoinClubResponse> {
  if (!clubId?.trim()) {
    throw new Error("Club ID is required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to leave a club");
  }

  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/member`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || "Failed to leave club";
    throw new Error(message);
  }

  return JoinClubResponseSchema.parse(payload.data) as JoinClubResponse;
}
