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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050302]/75 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#C9A96E]/30 bg-[#100904] shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
        <div className="border-b border-[#C9A96E]/20 bg-[#2A1810]/90 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#C9A96E]/15 text-[#C9A96E]">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                  New Reading Circle
                </p>
                <h3 className="mt-1 font-serif text-3xl text-[#F2E8D9]">
                  Create Club
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-full border border-[#C9A96E]/20 p-2 text-[#F2E8D9]/70 transition hover:border-[#C9A96E]/50 hover:text-[#F2E8D9]"
              aria-label="Close create club modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-sm text-[#F2E8D9]/70">
            Give the club a clear promise. Readers should understand the mood,
            genre, and privacy before they join.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-6"
          noValidate
        >
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
          />

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-[#F2E8D9]/80">
              Club Name
            </label>
            <input
              id="name"
              placeholder="Sci-Fi Readers"
              className="w-full rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-[#f87171]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm text-[#F2E8D9]/80">
              Description
            </label>
            <textarea
              id="description"
              placeholder="What your club is about..."
              rows={4}
              className="min-h-28 w-full resize-none rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-[#f87171]">
                {errors.description.message}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#C9A96E]/20 bg-[#2A1810]/70 p-4 text-sm">
            <span className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A96E]/15 text-[#C9A96E]">
                <Globe className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-medium text-[#F2E8D9]">
                  Public club
                </span>
                <span className="text-xs text-[#F2E8D9]/55">
                  Anyone can discover and join.
                </span>
              </span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[#C9A96E]"
              {...register("isPublic")}
            />
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg border border-[#C9A96E]/35 px-4 py-2.5 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2.5 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:opacity-60"
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
