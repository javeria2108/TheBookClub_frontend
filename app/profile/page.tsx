"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, RefreshCw, Sparkles } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { JoinedClubsGrid } from "@/components/profile/JoinedClubsGrid";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { getUserProfile, updateUserProfile } from "@/lib/profile";
import type { UpdateUserProfilePayload, UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isReady, logout, user } = useAuthState();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const nextProfile = await getUserProfile();
      setProfile(nextProfile);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load your profile";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/auth/login?returnTo=/profile");
      return;
    }

    void loadProfile();
  }, [isAuthenticated, isReady, loadProfile, router]);

  const handleProfileUpdate = async (payload: UpdateUserProfilePayload) => {
    try {
      setIsSaving(true);
      const updatedProfile = await updateUserProfile(payload);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your reader profile has been saved.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to update profile",
        description:
          err instanceof Error
            ? err.message
            : "Please review your profile details and try again.",
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const userInitial =
    profile?.username.charAt(0).toUpperCase() ??
    user?.name?.charAt(0).toUpperCase() ??
    "R";

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        isAuthReady={isReady}
        userInitial={userInitial}
        onLogout={logout}
      />

      {!isReady || isLoading ? (
        <ProfileSkeleton />
      ) : error ? (
        <section className="mx-auto w-full max-w-4xl px-5 pb-12 pt-28 md:px-8">
          <div className="rounded-2xl border border-[#8B4A3C]/60 bg-[#8B4A3C]/15 p-8 text-center">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-[#C9A96E]" />
            <h1 className="font-serif text-3xl text-[#F2E8D9]">
              Unable to load profile
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#F2E8D9]/70">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadProfile()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </section>
      ) : profile ? (
        <section className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-28 md:px-8">
          {isEditing ? (
            <ProfileEditForm
              profile={profile}
              isSaving={isSaving}
              onCancel={() => setIsEditing(false)}
              onAvatarUploaded={(updatedProfile) => setProfile(updatedProfile)}
              onSubmit={handleProfileUpdate}
            />
          ) : (
            <>
              <ProfileHeader
                profile={profile}
                onEdit={() => setIsEditing(true)}
              />

              <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
                <section className="rounded-xl border border-[#C9A96E]/20 bg-[#2A1810]/85 p-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                    Bio
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#F2E8D9]/75">
                    {profile.bio ||
                      "No bio yet. Add a few lines about the books and conversations you care about."}
                  </p>
                </section>

                <section className="rounded-xl border border-[#C9A96E]/20 bg-[#2A1810]/85 p-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                    Favorite Genres
                  </p>
                  {profile.favoriteGenres.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.favoriteGenres.map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full border border-[#C9A96E]/25 bg-[#1A0F07] px-3 py-1.5 text-sm text-[#F2E8D9]/80"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-[#F2E8D9]/70">
                      No favorite genres selected yet.
                    </p>
                  )}
                </section>
              </div>

              <section className="mt-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#C9A96E]" />
                    <h2 className="font-serif text-3xl text-[#F2E8D9]">
                      Joined Clubs
                    </h2>
                  </div>
                  <p className="hidden text-sm text-[#F2E8D9]/55 sm:block">
                    {profile.joinedClubs.length} joined
                  </p>
                </div>
                <JoinedClubsGrid clubs={profile.joinedClubs} />
              </section>

              <section className="mt-8 rounded-xl border border-[#C9A96E]/20 bg-[#100904]/75 p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                  Reading Stats
                </p>
                <p className="mt-3 text-sm text-[#F2E8D9]/70">
                  Reading statistics will appear after reading cycles are added
                  to BookCircle.
                </p>
              </section>
            </>
          )}
        </section>
      ) : null}
    </main>
  );
}
