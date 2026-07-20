"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, ChevronLeft, Globe, Save, Settings2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { AppHeader } from "@/components/layout/AppHeader";
import { ClubCoverUpload } from "@/components/clubs/ClubCoverUpload";
import { ClubSettingsFormSchema, UpdateClubPayloadSchema } from "@/lib/contracts/club.contract";
import { deleteClub, getClubById, updateClub } from "@/lib/clubs";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
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

  const handleDeleteClub = async () => {
    if (!club || deleteConfirmation !== club.name) {
      toast({
        variant: "destructive",
        title: "Confirmation required",
        description: "Type the club name exactly before deleting it.",
      });
      return;
    }

    try {
      setIsDeleting(true);
      await deleteClub(clubId);
      toast({
        title: "Club deleted",
        description: `${club.name} has been removed.`,
      });
      router.push("/my-clubs");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to delete club",
        description: err instanceof Error ? err.message : "Failed to delete club",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

  return (
    <main className="app-page">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        isAuthReady={isReady}
        userInitial={userInitial}
        onLogout={logout}
      />

      <section className="app-container max-w-4xl">
        <Link
          href={`/clubs/${clubId}`}
          className="mb-8 inline-flex items-center gap-2 text-[var(--app-accent-gold)] transition hover:text-[var(--app-accent-gold-hover)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Club
        </Link>

        {isLoading ? (
          <div className="app-surface rounded-2xl p-8 text-center">
            <p className="text-lg">Loading club settings...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#8B4A3C]/60 bg-[#8B4A3C]/15 p-6">
            <p className="font-semibold text-[var(--app-text-primary)]">Unable to load settings</p>
            <p className="mt-2 text-sm text-[var(--app-text-secondary)]">{error}</p>
          </div>
        ) : club ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="app-modal-panel min-w-0 max-w-none max-h-none overflow-visible"
          >
            <div className="app-modal-header p-4 sm:p-6 md:p-8">
              <div className="flex min-w-0 items-start gap-4">
                <span className="app-icon-frame h-12 w-12 shrink-0 rounded-xl">
                  <Settings2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--app-accent-gold)] sm:tracking-[0.2em]">
                    Owner Settings
                  </p>
                  <h1 className="mt-2 break-words font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
                    {club.name}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm text-[var(--app-text-secondary)]">
                    Update your club details and choose the cover image readers
                    will see across discovery, dashboard, and club pages.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 p-4 sm:p-6 md:p-8"
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
                  <label htmlFor="name" className="app-field-label">
                    Club Name
                  </label>
                  <input
                    id="name"
                    className="app-input w-full px-3 py-3 text-sm"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-[#f87171]">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label
                    htmlFor="description"
                    className="app-field-label"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="app-input min-h-28 w-full resize-none px-3 py-3 text-sm"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-[#f87171]">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="genre" className="app-field-label">
                    Genre
                  </label>
                  <input
                    id="genre"
                    placeholder="Literary Fiction"
                    className="app-input w-full px-3 py-3 text-sm"
                    {...register("genre")}
                  />
                  {errors.genre && (
                    <p className="text-sm text-[#f87171]">{errors.genre.message}</p>
                  )}
                </div>

                <label className="app-choice-row flex min-w-0 cursor-pointer flex-col gap-4 rounded-xl p-4 text-sm transition hover:border-[var(--app-border-strong)] sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="app-icon-frame h-9 w-9 shrink-0 rounded-lg">
                      <Globe className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-[var(--app-text-primary)]">
                        Public club
                      </span>
                      <span className="text-xs text-[var(--app-text-muted)]">
                        Visible in discovery and open to join.
                      </span>
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-[var(--app-accent-gold)]"
                    {...register("isPublic")}
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--app-border-subtle)] pt-6 sm:flex-row sm:justify-end">
                <Link
                  href={`/clubs/${clubId}`}
                  className="app-button-secondary w-full sm:w-auto"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="app-button-primary w-full disabled:opacity-60 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>

            <section className="border-t border-[rgba(196,95,95,0.35)] p-4 sm:p-6 md:p-8">
              <div className="rounded-2xl border border-[rgba(196,95,95,0.5)] bg-[rgba(67,38,33,0.26)] p-4 sm:p-5">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(196,95,95,0.45)] bg-[rgba(196,95,95,0.12)] text-[var(--app-danger)]">
                        <AlertTriangle className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-2xl text-[var(--app-text-primary)]">
                          Delete club
                        </p>
                        <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                          This permanently removes the club, memberships,
                          reading cycles, discussions, votes, notifications,
                          and chat history.
                        </p>
                      </div>
                    </div>

                    <label
                      htmlFor="delete-confirmation"
                      className="app-field-label mt-5 block"
                    >
                      Type {club.name} to confirm
                    </label>
                    <input
                      id="delete-confirmation"
                      value={deleteConfirmation}
                      onChange={(event) => setDeleteConfirmation(event.target.value)}
                      className="app-input mt-2 w-full px-3 py-3 text-sm"
                      disabled={isDeleting}
                      autoComplete="off"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDeleteClub()}
                    disabled={isDeleting || deleteConfirmation !== club.name}
                    className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[rgba(196,95,95,0.55)] bg-[rgba(196,95,95,0.16)] px-4 py-3 text-sm font-bold text-[#ffd6d6] transition hover:bg-[rgba(196,95,95,0.25)] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete Club"}
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        ) : null}
      </section>
    </main>
  );
}
