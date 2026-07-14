"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Globe, Save, Settings2 } from "lucide-react";
import { motion } from "framer-motion";

import { AppHeader } from "@/components/layout/AppHeader";
import { ClubCoverUpload } from "@/components/clubs/ClubCoverUpload";
import { ClubSettingsFormSchema, UpdateClubPayloadSchema } from "@/lib/contracts/club.contract";
import { getClubById, updateClub } from "@/lib/clubs";
import { useAuthState } from "@/hooks/useAuthState";
import { useToast } from "@/components/ui/use-toast";
import type { Club } from "@/lib/types";

type SettingsFormValues = z.input<typeof ClubSettingsFormSchema>;

export default function ClubSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  const { isAuthenticated, isReady, logout, user } = useAuthState();
  const { toast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(ClubSettingsFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
      genre: "",
    },
  });

  const loadClub = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getClubById(clubId);
      setClub(response.club);
      setCoverImage(response.club.coverImage ?? null);
      reset({
        name: response.club.name,
        description: response.club.description ?? "",
        isPublic: response.club.isPublic,
        genre: response.club.genre ?? "",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch club settings";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [clubId, reset]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(
        `/auth/login?returnTo=${encodeURIComponent(`/clubs/${clubId}/settings`)}`,
      );
      return;
    }

    void loadClub();
  }, [clubId, isAuthenticated, isReady, loadClub, router]);

  useEffect(() => {
    if (!isLoading && club && club.memberRole !== "OWNER") {
      router.replace(`/clubs/${clubId}`);
    }
  }, [club, clubId, isLoading, router]);

  const onSubmit = async (data: SettingsFormValues) => {
    if (!club || !coverImage) {
      toast({
        variant: "destructive",
        title: "Cover image required",
        description: "Upload a cover image before saving club settings.",
      });
      return;
    }

    try {
      setIsSaving(true);

      const payload = UpdateClubPayloadSchema.parse({
        name: data.name,
        description: data.description?.trim() ? data.description.trim() : null,
        isPublic: data.isPublic,
        genre: data.genre?.trim() ? data.genre.trim() : null,
        coverImage,
      });

      const response = await updateClub(clubId, payload);
      setClub(response.club);
      setCoverImage(response.club.coverImage ?? null);
      toast({
        title: "Club settings saved",
        description: "Your club details and cover image were updated.",
      });
      router.push(`/clubs/${clubId}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description:
          err instanceof Error ? err.message : "Failed to save club settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      <AppHeader
        mode="app"
        isAuthenticated={isReady && isAuthenticated}
        userInitial={userInitial}
        onLogout={logout}
      />

      <section className="mx-auto w-full max-w-4xl px-5 pb-12 pt-28 md:px-8">
        <Link
          href={`/clubs/${clubId}`}
          className="mb-8 inline-flex items-center gap-2 text-[#C9A96E] transition hover:text-[#d8b884]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Club
        </Link>

        {isLoading ? (
          <div className="rounded-2xl border border-[#C9A96E]/20 bg-[#2A1810] p-8 text-center">
            <p className="text-lg">Loading club settings...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#8B4A3C]/60 bg-[#8B4A3C]/15 p-6">
            <p className="font-semibold text-[#F2E8D9]">Unable to load settings</p>
            <p className="mt-2 text-sm text-[#F2E8D9]/75">{error}</p>
          </div>
        ) : club ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="overflow-hidden rounded-2xl border border-[#C9A96E]/25 bg-[#100904] shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
          >
            <div className="border-b border-[#C9A96E]/20 bg-[#2A1810]/90 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A96E]/15 text-[#C9A96E]">
                  <Settings2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                    Owner Settings
                  </p>
                  <h1 className="mt-2 font-serif text-4xl leading-none md:text-5xl">
                    {club.name}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm text-[#F2E8D9]/70">
                    Update your club details and choose the cover image readers
                    will see across discovery, dashboard, and club pages.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 p-6 md:p-8"
              noValidate
            >
              <ClubCoverUpload
                value={coverImage}
                onChange={setCoverImage}
                disabled={isSaving}
                helperText="This image appears on club cards and the club detail hero."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="name" className="text-sm text-[#F2E8D9]/80">
                    Club Name
                  </label>
                  <input
                    id="name"
                    className="w-full rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-[#f87171]">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label
                    htmlFor="description"
                    className="text-sm text-[#F2E8D9]/80"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
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

                <div className="space-y-2">
                  <label htmlFor="genre" className="text-sm text-[#F2E8D9]/80">
                    Genre
                  </label>
                  <input
                    id="genre"
                    placeholder="Literary Fiction"
                    className="w-full rounded-lg border border-[#C9A96E]/30 bg-[#1A0F07] px-3 py-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
                    {...register("genre")}
                  />
                  {errors.genre && (
                    <p className="text-sm text-[#f87171]">{errors.genre.message}</p>
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
                        Visible in discovery and open to join.
                      </span>
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-[#C9A96E]"
                    {...register("isPublic")}
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#C9A96E]/15 pt-6 sm:flex-row sm:justify-end">
                <Link
                  href={`/clubs/${clubId}`}
                  className="inline-flex items-center justify-center rounded-lg border border-[#C9A96E]/35 px-4 py-2.5 text-sm text-[#F2E8D9] transition hover:border-[#C9A96E]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2.5 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </motion.div>
        ) : null}
      </section>
    </main>
  );
}
