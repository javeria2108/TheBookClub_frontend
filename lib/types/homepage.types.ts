import type { AuthUser } from "./auth.types";

export type AuthStateUser = AuthUser & { name: string };

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthState = {
  status: AuthStatus;
  isAuthenticated: boolean;
  isReady: boolean;
  error?: string;
  user?: AuthStateUser;
  logout: () => Promise<void>;
};

export type LandingClub = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  genre: string;
  isPrivate: boolean;
  coverImage: string | null;
};

export type LandingStats = {
  readerCount: number;
  clubCount: number;
  activeReadingCycles: number;
  discussionTopics: number;
  readingEntries: number;
  openVoteRounds: number;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  avatarImage: string;
};
