export type AuthUser = { name: string };

export type AuthState = {
  isAuthenticated: boolean;
  user?: AuthUser;
};

export type LandingClub = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  genre: string;
  isPrivate: boolean;
  coverImage: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  avatarImage: string;
};