export type AuthStateUser = { name: string };

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

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  avatarImage: string;
};
