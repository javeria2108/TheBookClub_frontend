export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type LoginRequestPayload = {
  email: string;
  password: string;
};

export type SignupRequestPayload = {
  name: string;
  email: string;
  password: string;
};
