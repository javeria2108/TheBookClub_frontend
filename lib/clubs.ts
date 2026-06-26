const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

import {
  GetClubsParamsSchema,
  GetClubsResponseSchema,
  CreateClubPayloadSchema,
  UpdateClubPayloadSchema,
  CreateClubResponseSchema,
  GetClubByIdResponseSchema,
  JoinClubResponseSchema,
  GetClubMembersResponseSchema,
  OperationMessageSchema,
  GetChatMessagesResponseSchema,
} from "@/lib/contracts/club.contract";
import {
  GetClubsParams,
  GetClubsResponse,
  CreateClubPayload,
  CreateClubResponse,
  UpdateClubPayload,
  GetClubByIdResponse,
  JoinClubResponse,
  ClubMemberSummary,
  OperationMessage,
  ChatMessage,
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
  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to create a club");
  }

  const response = await fetch(`${API_BASE_URL}/clubs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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

export async function updateClub(
  clubId: string,
  input: UpdateClubPayload,
): Promise<GetClubByIdResponse> {
  if (!clubId?.trim()) {
    throw new Error("Club ID is required");
  }

  const payload = UpdateClubPayloadSchema.parse(input);
  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to update a club");
  }

  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok) {
    const message =
      body?.error?.message || body?.message || "Failed to update club";
    throw new Error(message);
  }

  return GetClubByIdResponseSchema.parse(body.data) as GetClubByIdResponse;
}

export async function getClubById(id: string) {
  if (!id?.trim()) {
    throw new Error("Club ID is required");
  }

  const url = `${API_BASE_URL}/clubs/${id}`;
  const token = getStoredToken();

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
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
      limit: Math.max(clubs.length, 10),
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

export async function cancelJoinRequest(
  clubId: string,
): Promise<OperationMessage> {
  if (!clubId?.trim()) {
    throw new Error("Club ID is required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to cancel a join request");
  }

  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/join-request`, {
    method: "DELETE",
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
      "Failed to cancel join request";
    throw new Error(message);
  }

  return OperationMessageSchema.parse(payload.data) as OperationMessage;
}

export async function getJoinRequests(clubId: string) {
  if (!clubId?.trim()) {
    throw new Error("Club ID is required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to view join requests");
  }

  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/join-requests`, {
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
      "Failed to fetch join requests";
    throw new Error(message);
  }

  return payload.data.requests;
}

export async function approveJoinRequest(
  clubId: string,
  requestId: string,
): Promise<OperationMessage> {
  if (!clubId?.trim() || !requestId?.trim()) {
    throw new Error("Club ID and request ID are required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to approve requests");
  }

  const response = await fetch(
    `${API_BASE_URL}/clubs/${clubId}/join-requests/${requestId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "APPROVE" }),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || "Failed to approve request";
    throw new Error(message);
  }

  return OperationMessageSchema.parse(payload.data) as OperationMessage;
}

export async function rejectJoinRequest(
  clubId: string,
  requestId: string,
): Promise<OperationMessage> {
  if (!clubId?.trim() || !requestId?.trim()) {
    throw new Error("Club ID and request ID are required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to reject requests");
  }

  const response = await fetch(
    `${API_BASE_URL}/clubs/${clubId}/join-requests/${requestId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "REJECT" }),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || "Failed to reject request";
    throw new Error(message);
  }

  return OperationMessageSchema.parse(payload.data) as OperationMessage;
}

export async function updateMemberRole(
  clubId: string,
  userId: string,
  role: "MEMBER" | "MODERATOR",
): Promise<{ memberId: string; userId: string; role: string }> {
  if (!clubId?.trim() || !userId?.trim()) {
    throw new Error("Club ID and user ID are required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to manage member roles");
  }

  const response = await fetch(
    `${API_BASE_URL}/clubs/${clubId}/members/${userId}/role`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      "Failed to update member role";
    throw new Error(message);
  }

  return payload.data;
}

export async function getClubMembers(
  clubId: string,
): Promise<ClubMemberSummary[]> {
  if (!clubId?.trim()) {
    throw new Error("Club ID is required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to view club members");
  }

  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/members`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || "Failed to fetch members";
    throw new Error(message);
  }

  const data = GetClubMembersResponseSchema.parse(payload.data);
  return data.members;
}

export async function transferClubOwnership(
  clubId: string,
  targetUserId: string,
): Promise<OperationMessage> {
  if (!clubId?.trim() || !targetUserId?.trim()) {
    throw new Error("Club ID and target user ID are required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to transfer ownership");
  }

  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/ownership`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetUserId }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      "Failed to transfer ownership";
    throw new Error(message);
  }

  return OperationMessageSchema.parse(payload.data) as OperationMessage;
}

export async function deleteClub(clubId: string): Promise<OperationMessage> {
  if (!clubId?.trim()) {
    throw new Error("Club ID is required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to delete a club");
  }

  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || "Failed to delete club";
    throw new Error(message);
  }

  return OperationMessageSchema.parse(payload.data) as OperationMessage;
}

export async function getChatMessages(
  clubId: string,
  roomId: string,
  limit = 50,
): Promise<ChatMessage[]> {
  if (!clubId?.trim()) {
    throw new Error("Club ID is required");
  }

  if (!roomId?.trim()) {
    throw new Error("Room ID is required");
  }

  const token = getStoredToken();

  if (!token) {
    throw new Error("You must be logged in to view chat");
  }

  const params = new URLSearchParams({
    roomId,
    limit: String(limit),
  });

  const response = await fetch(
    `${API_BASE_URL}/clubs/${clubId}/chat/messages?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || "Failed to fetch chat messages";
    throw new Error(message);
  }

  const data = GetChatMessagesResponseSchema.parse(payload.data);
  return data.messages;
}
