"use client";

import { Camera } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

import { uploadUserAvatar, validateAvatarFile } from "@/lib/profile";
import type { UserProfile } from "@/lib/types";

type AvatarUploadProps = {
  profile: UserProfile;
  onUploaded: (profile: UserProfile) => void;
};

function getInitial(username: string): string {
  return username.trim().charAt(0).toUpperCase() || "R";
}

export function AvatarUpload({ profile, onUploaded }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateAvatarFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      const updatedProfile = await uploadUserAvatar(file);
      onUploaded(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-surface-subtle)] text-3xl font-semibold text-[var(--app-accent-gold)] sm:h-20 sm:w-20">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={`${profile.username}'s avatar`}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitial(profile.username)
          )}
        </div>
        <div className="w-full min-w-0 sm:w-auto">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="app-button-secondary w-full whitespace-nowrap disabled:opacity-60 sm:w-auto"
          >
            <Camera className="h-4 w-4 shrink-0" />
            <span>
              {isUploading
                ? "Uploading..."
                : profile.avatarUrl
                  ? "Replace Avatar"
                  : "Upload Avatar"}
            </span>
          </button>
          <p className="mt-2 text-xs text-[var(--app-text-muted)]">
            JPEG, PNG, or WebP. Maximum 2 MB.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      {error ? <p className="text-sm text-[#f87171]">{error}</p> : null}
    </div>
  );
}
