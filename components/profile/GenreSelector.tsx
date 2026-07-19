"use client";

import { PROFILE_GENRE_OPTIONS } from "@/lib/contracts/profile.contract";

type GenreSelectorProps = {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: string;
};

const MAX_SELECTED_GENRES = 8;

export function GenreSelector({
  value,
  onChange,
  disabled = false,
  error,
}: GenreSelectorProps) {
  const toggleGenre = (genre: string) => {
    if (disabled) return;

    if (value.includes(genre)) {
      onChange(value.filter((selectedGenre) => selectedGenre !== genre));
      return;
    }

    if (value.length >= MAX_SELECTED_GENRES) {
      return;
    }

    onChange([...value, genre]);
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-[var(--app-text-secondary)]">
        Favorite Genres
      </legend>
      <div className="flex flex-wrap gap-2">
        {PROFILE_GENRE_OPTIONS.map((genre) => {
          const isSelected = value.includes(genre);

          return (
            <button
              key={genre}
              type="button"
              disabled={
                disabled || (!isSelected && value.length >= MAX_SELECTED_GENRES)
              }
              onClick={() => toggleGenre(genre)}
              className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus-ring)] ${
                isSelected
                  ? "border-[rgba(216,181,109,0.56)] bg-[linear-gradient(180deg,rgba(35,29,16,0.94),rgba(20,18,13,0.94))] text-[#F7DFA5] shadow-[inset_3px_0_0_rgba(216,181,109,0.72)]"
                  : "border-[var(--app-border-subtle)] bg-[rgba(244,234,216,0.045)] text-[var(--app-text-secondary)] hover:border-[var(--app-border-strong)]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {genre}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[var(--app-text-muted)]">
        Choose up to {MAX_SELECTED_GENRES}. These help others understand what
        kind of reading circles you enjoy.
      </p>
      {error ? <p className="text-sm text-[#f87171]">{error}</p> : null}
    </fieldset>
  );
}
