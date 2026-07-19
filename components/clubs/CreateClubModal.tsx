"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CreateClubFormSchema, CreateClubPayloadSchema } from "@/lib/contracts/club.contract";
import { createClub } from "@/lib/clubs";
import { ClubCoverUpload } from "@/components/clubs/ClubCoverUpload";
import { toast } from "@/components/ui/use-toast";
import { BookOpen, Globe, Lock, X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void | Promise<void>;
};

type CreateClubFormValues = z.input<typeof CreateClubFormSchema>;

export function CreateClubModal({ open, onOpenChange, onCreated }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClubFormValues>({
    resolver: zodResolver(CreateClubFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
    },
    mode: "onBlur",
  });

  const resetForm = () => {
    reset();
    setCoverImage(null);
    setCoverError(null);
  };

  const onSubmit = async (data: CreateClubFormValues) => {
    if (!coverImage) {
      setCoverError("Cover image is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setCoverError(null);

      const payload = CreateClubPayloadSchema.parse({
        ...data,
        coverImage,
      });
      await createClub(payload);
      await onCreated();
      resetForm();
      onOpenChange(false);
      toast({
        title: "Club created",
        description: `${payload.name} is ready for members.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to create club",
        description:
          err instanceof Error ? err.message : "Failed to create club",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="app-modal-backdrop">
      <div className="app-modal-panel create-club-modal">
        <div className="app-modal-header shrink-0 p-3 sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3 sm:items-start">
              <span className="app-icon-frame hidden h-11 w-11 shrink-0 rounded-xl sm:inline-flex">
                <BookOpen className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--app-accent-gold)] sm:text-[11px] sm:tracking-[0.2em]">
                  New Reading Circle
                </p>
                <h3 className="mt-1 break-words font-serif text-2xl leading-tight text-[var(--app-text-primary)] sm:text-3xl">
                  Create Club
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="shrink-0 rounded-lg border border-[var(--app-border-subtle)] p-2 text-[var(--app-text-secondary)] transition hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-primary)]"
              aria-label="Close create club modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)] sm:block">
            Give the club a clear promise. Readers should understand the mood,
            genre, and privacy before they join.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="create-club-modal-body grid gap-4 p-3 sm:gap-5 sm:p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <ClubCoverUpload
                value={coverImage}
                onChange={(url) => {
                  setCoverImage(url);
                  if (url) {
                    setCoverError(null);
                  }
                }}
                disabled={isSubmitting}
                error={coverError ?? undefined}
                helperText="JPEG, PNG, or WebP. Max 5 MB."
                previewClassName="create-club-cover-preview"
              />
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="app-field-label">
                  Club Name
                </label>
                <input
                  id="name"
                  placeholder="Sci-Fi Readers"
                  className="app-input w-full px-3 py-3 text-sm"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-[#f87171]">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="app-field-label">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="What your club is about..."
                  rows={5}
                  className="app-input min-h-32 w-full resize-none px-3 py-3 text-sm lg:min-h-40"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-[#f87171]">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <label className="app-choice-row flex min-w-0 cursor-pointer gap-4 rounded-xl p-4 text-sm transition hover:border-[var(--app-border-strong)]">
                <span className="app-icon-frame h-9 w-9 shrink-0 rounded-lg">
                  <Globe className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-[var(--app-text-primary)]">
                    Public club
                  </span>
                  <span className="text-xs text-[var(--app-text-muted)]">
                    Anyone can discover and join.
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--app-accent-gold)]"
                  {...register("isPublic")}
                />
              </label>
            </div>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.58)] p-3 sm:flex-row sm:justify-end sm:gap-3 sm:p-5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="app-button-secondary w-full disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="app-button-primary w-full disabled:opacity-60 sm:w-auto"
            >
              <Lock className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Club"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
