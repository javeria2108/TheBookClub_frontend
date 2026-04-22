import type { GetClubsResponse } from "@/lib/types";
import type { LandingClub, Testimonial } from "@/lib/types";

export const mockClubs: LandingClub[] = [
  {
    id: "literary-fiction-society",
    name: "Literary Fiction Society",
    description:
      "Exploring modern classics with thoughtful discussion and shared annotation sessions.",
    memberCount: 48,
    genre: "Literary Fiction",
    isPrivate: false,
    coverImage:
      "https://images.unsplash.com/photo-1455885666463-9c4b7fe58a8f?w=900&q=80",
  },
  {
    id: "mystery-mavens",
    name: "Mystery Mavens",
    description:
      "Crime, noir, and puzzling endings—weekly debates on clues and craft.",
    memberCount: 35,
    genre: "Mystery",
    isPrivate: false,
    coverImage:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=900&q=80",
  },
  {
    id: "speculative-circle",
    name: "Speculative Circle",
    description:
      "From dystopia to cosmic epics, we read speculative fiction with rigor.",
    memberCount: 29,
    genre: "Science Fiction",
    isPrivate: false,
    coverImage:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80",
  },
  {
    id: "quiet-philosophy-room",
    name: "Quiet Philosophy Room",
    description:
      "Small, focused private discussions around ethics, meaning, and modern life.",
    memberCount: 14,
    genre: "Philosophy",
    isPrivate: true,
    coverImage:
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=900&q=80",
  },
  {
    id: "memoir-notes-club",
    name: "Memoir Notes Club",
    description:
      "Life writing and memory, with monthly long-form reflection circles.",
    memberCount: 22,
    genre: "Memoir",
    isPrivate: true,
    coverImage:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=900&q=80",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "BookCircle made our discussions sharper and more intimate. Every session feels like an evening in a real bookshop.",
    author: "Maya Patel",
    role: "Member · Literary Fiction Society",
    avatarImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
  },
  {
    quote:
      "The private club tools are exactly what we needed—focused conversations, clean scheduling, no noise.",
    author: "Daniel Kim",
    role: "Owner · Quiet Philosophy Room",
    avatarImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
  },
  {
    quote:
      "Voting and async chat keep momentum between meetings. We now finish more books and enjoy them more deeply.",
    author: "Elena Rossi",
    role: "Member · Speculative Circle",
    avatarImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
  },
];

export function mapApiClubsToLandingClubs(
  apiClubs: GetClubsResponse["clubs"],
): LandingClub[] {
  return apiClubs.map((apiClub, index) => ({
    id: apiClub.id,
    name: apiClub.name,
    description: apiClub.description ?? "No description yet.",
    isPrivate: !apiClub.isPublic,
    memberCount: 0,
    genre: "General",
    coverImage: mockClubs[index % mockClubs.length].coverImage,
  }));
}