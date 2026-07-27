import { getJson } from "@/lib/api";
import { resolveBackendImageUrl } from "@/lib/image-url";
import type { GetClubsResponse, LandingClub, LandingStats } from "@/lib/types";

export function mapApiClubsToLandingClubs(
  apiClubs: GetClubsResponse["clubs"],
): LandingClub[] {
  return apiClubs.map((apiClub) => ({
    id: apiClub.id,
    name: apiClub.name,
    description: apiClub.description ?? "No description yet.",
    isPrivate: !apiClub.isPublic,
    memberCount: apiClub.memberCount ?? 0,
    genre: apiClub.genre ?? "General",
    coverImage: resolveBackendImageUrl(apiClub.coverImage),
  }));
}

export async function getHomepageStats(): Promise<LandingStats> {
  return getJson<LandingStats>("/homepage/stats");
}

export function getLandingMetrics(
  clubs: LandingClub[],
  stats: LandingStats | null,
) {
  const totalMembers = clubs.reduce((sum, club) => sum + club.memberCount, 0);
  const genreCount = new Set(clubs.map((club) => club.genre).filter(Boolean))
    .size;
  const privateClubs = clubs.filter((club) => club.isPrivate).length;

  return {
    readerCount: stats?.readerCount ?? totalMembers,
    clubCount: stats?.clubCount ?? clubs.length,
    activeReadingCycles: stats?.activeReadingCycles ?? 0,
    discussionTopics: stats?.discussionTopics ?? 0,
    readingEntries: stats?.readingEntries ?? 0,
    openVoteRounds: stats?.openVoteRounds ?? 0,
    genreCount,
    privateClubs,
  };
}
