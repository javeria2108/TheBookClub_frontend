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
      <legend className="text-sm font-medium text-[#F2E8D9]/85">
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
              className={`rounded-full border px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] ${
                isSelected
                  ? "border-[#C9A96E] bg-[#C9A96E] text-[#1A0F07]"
                  : "border-[#C9A96E]/25 bg-[#1A0F07] text-[#F2E8D9]/75 hover:border-[#C9A96E]/60"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {genre}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[#F2E8D9]/55">
        Choose up to {MAX_SELECTED_GENRES}. These help others understand what
        kind of reading circles you enjoy.
      </p>
      {error ? <p className="text-sm text-[#f87171]">{error}</p> : null}
    </fieldset>
  );
}
