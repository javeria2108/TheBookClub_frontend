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
    <section className="rounded-2xl border border-[#C9A96E]/25 bg-[#100904]/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.36)] md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
            Profile Settings
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#F2E8D9]">
            Shape your reader identity
          </h1>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#C9A96E]/35 px-4 py-2 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E] hover:text-[#C9A96E] disabled:opacity-60"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>

      <div className="mb-7 rounded-xl border border-[#C9A96E]/15 bg-[#2A1810]/70 p-4">
        <AvatarUpload profile={profile} onUploaded={onAvatarUploaded} />
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm text-[#F2E8D9]/85">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isSaving}
            className="w-full rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none disabled:opacity-60"
          />
          {errors.username ? (
            <p className="text-sm text-[#f87171]">{errors.username}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm text-[#F2E8D9]/85">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            disabled={isSaving}
            rows={5}
            placeholder="Share the kinds of books, ideas, and conversations you love."
            className="min-h-32 w-full resize-none rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-3 text-xs text-[#F2E8D9]/55">
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
          <p className="rounded-lg border border-[#8B4A3C]/50 bg-[#8B4A3C]/15 p-3 text-sm text-[#F2E8D9]">
            {errors.form}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-lg border border-[#C9A96E]/35 px-4 py-2.5 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2.5 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
