"use client";

import { Save, X } from "lucide-react";
import { FormEvent, useState } from "react";

import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { GenreSelector } from "@/components/profile/GenreSelector";
import { UpdateUserProfilePayloadSchema } from "@/lib/contracts/profile.contract";
import type { UpdateUserProfilePayload, UserProfile } from "@/lib/types";

type ProfileEditFormProps = {
  profile: UserProfile;
  isSaving: boolean;
  onCancel: () => void;
  onAvatarUploaded: (profile: UserProfile) => void;
  onSubmit: (payload: UpdateUserProfilePayload) => Promise<void>;
};

type FormErrors = {
  username?: string;
  bio?: string;
  favoriteGenres?: string;
  form?: string;
};

export function ProfileEditForm({
  profile,
  isSaving,
  onCancel,
  onAvatarUploaded,
  onSubmit,
}: ProfileEditFormProps) {
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(
    profile.favoriteGenres,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = UpdateUserProfilePayloadSchema.safeParse({
      username,
      bio,
      favoriteGenres,
    });

    if (!validation.success) {
      const nextErrors: FormErrors = {};

      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];

        if (fieldName === "username") {
          nextErrors.username = issue.message;
        }

        if (fieldName === "bio") {
          nextErrors.bio = issue.message;
        }

        if (fieldName === "favoriteGenres") {
          nextErrors.favoriteGenres = issue.message;
        }
      });

      setErrors(
        Object.keys(nextErrors).length > 0
          ? nextErrors
          : { form: "Please review the highlighted fields." },
      );
      return;
    }

    setErrors({});
    try {
      await onSubmit(validation.data);
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : "Unable to save your profile. Please try again.",
      });
    }
  };

  return (
    <section className="app-surface-elevated min-w-0 rounded-2xl p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--app-accent-gold)] sm:tracking-[0.2em]">
            Profile Settings
          </p>
          <h1 className="mt-2 break-words font-serif text-3xl text-[var(--app-text-primary)] sm:text-4xl">
            Shape your reader identity
          </h1>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="app-button-secondary w-full disabled:opacity-60 sm:w-auto"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>

      <div className="mb-7 rounded-2xl border border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.34)] p-4 sm:p-5">
        <AvatarUpload profile={profile} onUploaded={onAvatarUploaded} />
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm text-[var(--app-text-secondary)]">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isSaving}
            className="app-input w-full px-3 py-3 text-sm disabled:opacity-60"
          />
          {errors.username ? (
            <p className="text-sm text-[#f87171]">{errors.username}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm text-[var(--app-text-secondary)]">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            disabled={isSaving}
            rows={5}
            placeholder="Share the kinds of books, ideas, and conversations you love."
            className="app-input min-h-32 w-full resize-none px-3 py-3 text-sm disabled:opacity-60"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--app-text-muted)]">
            <span>Keep it short and human.</span>
            <span>{bio.trim().length}/500</span>
          </div>
          {errors.bio ? (
            <p className="text-sm text-[#f87171]">{errors.bio}</p>
          ) : null}
        </div>

        <GenreSelector
          value={favoriteGenres}
          onChange={setFavoriteGenres}
          disabled={isSaving}
          error={errors.favoriteGenres}
        />

        {errors.form ? (
          <p className="rounded-lg border border-[rgba(196,95,95,0.45)] bg-[rgba(196,95,95,0.12)] p-3 text-sm text-[var(--app-text-primary)]">
            {errors.form}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="app-button-secondary w-full disabled:opacity-60 sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="app-button-primary w-full disabled:opacity-60 sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
