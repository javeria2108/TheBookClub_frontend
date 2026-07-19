const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

type ApiSuccess<T> = {
  status: "success";
  data: T;
};

type ApiErrorShape =
  | { message?: string; error?: { code?: string; message?: string } }
  | Record<string, unknown>;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(payload: ApiErrorShape, fallback: string): string {
  if (
    "message" in payload &&
    typeof payload.message === "string" &&
    payload.message.trim()
  ) {
    return payload.message;
  }

  if (
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string" &&
    payload.error.message.trim()
  ) {
    return payload.error.message;
  }

  return fallback;
}

function getErrorCode(payload: ApiErrorShape): string | undefined {
  if (
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "code" in payload.error &&
    typeof payload.error.code === "string"
  ) {
    return payload.error.code;
  }

  return undefined;
}

async function readJsonResponse<TResponse>(
  response: Response,
): Promise<TResponse> {
  let payload: ApiSuccess<TResponse> | ApiErrorShape;

  try {
    payload = (await response.json()) as ApiSuccess<TResponse> | ApiErrorShape;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload as ApiErrorShape, "Request failed"),
      response.status,
      getErrorCode(payload as ApiErrorShape),
    );
  }

  return (payload as ApiSuccess<TResponse>).data;
}

export async function getJson<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
  });

  return readJsonResponse<TResponse>(response);
}

export async function postJson<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  return readJsonResponse<TResponse>(response);
}

export async function patchJson<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  return readJsonResponse<TResponse>(response);
}

export async function putJson<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  return readJsonResponse<TResponse>(response);
}

export async function deleteJson<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    credentials: "include",
  });

  return readJsonResponse<TResponse>(response);
}

export async function postForm<TResponse>(
  path: string,
  body: FormData,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body,
  });

  return readJsonResponse<TResponse>(response);
}
