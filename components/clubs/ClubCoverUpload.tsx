"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { uploadClubCoverImage, validateClubCoverFile } from "@/lib/uploads";

type ClubCoverUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
};

export function ClubCoverUpload({
  value,
  onChange,
  disabled = false,
  error,
  label = "Cover Image",
  helperText = "Upload a JPEG, PNG, or WebP image up to 5 MB.",
}: ClubCoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError = validateClubCoverFile(file);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setLocalError(null);
    setIsUploading(true);

    try {
      const uploaded = await uploadClubCoverImage(file);
      onChange(uploaded.url);
      setPreviewUrl(uploaded.url);
    } catch (uploadError) {
      setPreviewUrl(value);
      onChange(value);
      setLocalError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload cover image",
      );
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const displayError = error ?? localError;

  return (
    <div className="space-y-2">
      <label className="text-sm text-[#F2E8D9]/80">{label}</label>

      <div className="overflow-hidden rounded-xl border border-[#C9A96E]/25 bg-[#1A0F07]/70">
        <div className="relative aspect-[16/9] bg-[#100904]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Club cover preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-[#F2E8D9]/55">
              <ImagePlus className="h-10 w-10 text-[#C9A96E]/70" />
              <p className="text-sm">No cover image selected yet</p>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#050302]/70 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/30 px-4 py-2 text-sm text-[#F2E8D9]">
                <Loader2 className="h-4 w-4 animate-spin text-[#C9A96E]" />
                Uploading...
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#C9A96E]/15 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#F2E8D9]/55">{helperText}</p>
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#C9A96E]/35 px-4 py-2 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E] hover:text-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {previewUrl ? "Choose Another Image" : "Upload Cover Image"}
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
        disabled={disabled || isUploading}
      />

      {displayError && <p className="text-sm text-[#f87171]">{displayError}</p>}
    </div>
  );
}
