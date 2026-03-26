const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type ApiSuccess<T> = {
  status: "success";
  data: T;
};

type ApiErrorShape =
  | { message?: string; error?: { message?: string } }
  | Record<string, unknown>;

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

export async function postJson<TResponse, TBody>(
  path: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  let payload: ApiSuccess<TResponse> | ApiErrorShape;

  try {
    payload = (await response.json()) as ApiSuccess<TResponse> | ApiErrorShape;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload as ApiErrorShape, "Request failed"));
  }

  return (payload as ApiSuccess<TResponse>).data;
}
