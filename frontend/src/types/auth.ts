export type MembershipRole =
  | "owner"
  | "admin"
  | "developer"
  | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface AuthData {
  accessToken: string;
  expiresInSeconds: number;
  user: User;
  tenant: Tenant;
  role: MembershipRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthData;
}

export interface CurrentUserData {
  user: User;
  tenant: Tenant;
  role: MembershipRole;
}

export interface CurrentUserResponse {
  success: boolean;
  data: CurrentUserData;
}