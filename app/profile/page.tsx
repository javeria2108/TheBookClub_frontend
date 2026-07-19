"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { JoinedClubsGrid } from "@/components/profile/JoinedClubsGrid";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { ErrorState, SectionHeader, StatusBadge } from "@/components/ui/app-primitives";
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
    <main className="app-page">
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
        <section className="app-container max-w-4xl">
          <ErrorState
            title="Unable to load profile"
            description={error}
            action={
            <button
              type="button"
              onClick={() => void loadProfile()}
              className="app-button-primary"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            }
          />
        </section>
      ) : profile ? (
        <section className="app-container">
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
                <section className="app-surface rounded-2xl p-5">
                  <SectionHeader title="Bio" />
                  <p className="text-sm leading-6 text-[var(--app-text-secondary)]">
                    {profile.bio ||
                      "No bio yet. Add a few lines about the books and conversations you care about."}
                  </p>
                </section>

                <section className="app-surface rounded-2xl p-5">
                  <SectionHeader title="Favorite Genres" />
                  {profile.favoriteGenres.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.favoriteGenres.map((genre) => (
                        <StatusBadge key={genre} tone="muted">
                          {genre}
                        </StatusBadge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-[var(--app-text-secondary)]">
                      No favorite genres selected yet.
                    </p>
                  )}
                </section>
              </div>

              <section className="mt-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[var(--app-accent-gold)]" />
                    <h2 className="font-serif text-3xl text-[var(--app-text-primary)]">
                      Joined Clubs
                    </h2>
                  </div>
                  <p className="hidden text-sm text-[var(--app-text-muted)] sm:block">
                    {profile.joinedClubs.length} joined
                  </p>
                </div>
                <JoinedClubsGrid clubs={profile.joinedClubs} />
              </section>

              <section className="app-surface mt-8 rounded-2xl p-5">
                <SectionHeader title="Reading Stats" />
                <p className="text-sm text-[var(--app-text-secondary)]">
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
