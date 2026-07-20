import type { NextConfig } from "next";

function getBackendImagePattern() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "");

  if (!backendUrl) return null;

  try {
    const url = new URL(backendUrl);

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/uploads/**",
    };
  } catch {
    return null;
  }
}

const backendImagePattern = getBackendImagePattern();

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "books.google.com",
      },
      {
        protocol: "https",
        hostname: "books.google.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/uploads/**",
      },
      ...(backendImagePattern ? [backendImagePattern] : []),
    ],
  },
};

export default nextConfig;
