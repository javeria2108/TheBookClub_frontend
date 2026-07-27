import { API_BASE_URL } from "@/lib/api-base";

function getBackendOrigin(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    API_BASE_URL.replace(/\/api\/?$/, "");

  if (!raw) return null;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function resolveBackendImageUrl(src?: string | null): string | null {
  if (!src?.trim()) return null;

  const value = src.trim();
  const backendOrigin = getBackendOrigin();

  if (value.startsWith("/uploads/")) {
    return backendOrigin ? `${backendOrigin}${value}` : value;
  }

  try {
    const url = new URL(value);

    if (backendOrigin && isLocalHost(url.hostname) && url.pathname.startsWith("/uploads/")) {
      return `${backendOrigin}${url.pathname}${url.search}`;
    }

    return value;
  } catch {
    if (value.startsWith("uploads/") && backendOrigin) {
      return `${backendOrigin}/${value}`;
    }

    return value;
  }
}
