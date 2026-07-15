import { getJson, patchJson, postForm } from "@/lib/api";
import {
  UpdateUserProfilePayloadSchema,
  UserProfileResponseSchema,
} from "@/lib/contracts/profile.contract";
import type {
  UpdateUserProfilePayload,
  UserProfile,
  UserProfileResponse,
} from "@/lib/types";

const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return "Avatar must be a JPEG, PNG, or WebP file";
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return "Avatar must be 2 MB or smaller";
  }

  return null;
}

export async function getUserProfile(): Promise<UserProfile> {
  const data = await getJson<UserProfileResponse>("/users/me");
  return UserProfileResponseSchema.parse(data).profile;
}

export async function updateUserProfile(
  input: UpdateUserProfilePayload,
): Promise<UserProfile> {
  const payload = UpdateUserProfilePayloadSchema.parse(input);
  const data = await patchJson<UserProfileResponse, UpdateUserProfilePayload>(
    "/users/me",
    payload,
  );

  return UserProfileResponseSchema.parse(data).profile;
}

export async function uploadUserAvatar(file: File): Promise<UserProfile> {
  const validationError = validateAvatarFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("avatar", file);

  const data = await postForm<UserProfileResponse>("/users/me/avatar", formData);
  return UserProfileResponseSchema.parse(data).profile;
}
