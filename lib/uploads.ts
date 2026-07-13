const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

import { UploadClubCoverResponseSchema } from "@/lib/contracts/club.contract";
import type { UploadClubCoverResponse } from "@/lib/types";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateClubCoverFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Cover image must be a JPEG, PNG, or WebP file";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Cover image must be 5 MB or smaller";
  }

  return null;
}

export async function uploadClubCoverImage(
  file: File,
): Promise<UploadClubCoverResponse> {
  const validationError = validateClubCoverFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("coverImage", file);

  const response = await fetch(`${API_BASE_URL}/uploads/club-cover`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      "Failed to upload cover image";
    throw new Error(message);
  }

  return UploadClubCoverResponseSchema.parse(payload.data);
}
