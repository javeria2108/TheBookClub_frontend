import type { GetClubsResponse, LandingClub } from "@/lib/types";

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
    coverImage: apiClub.coverImage ?? null,
  }));
}

export function getLandingMetrics(clubs: LandingClub[]) {
  const totalMembers = clubs.reduce((sum, club) => sum + club.memberCount, 0);
  const genreCount = new Set(clubs.map((club) => club.genre).filter(Boolean))
    .size;
  const privateClubs = clubs.filter((club) => club.isPrivate).length;

  return {
    totalMembers,
    clubCount: clubs.length,
    genreCount,
    privateClubs,
  };
}
