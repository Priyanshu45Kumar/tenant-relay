import api from "../lib/axios";
import type {CurrentUserResponse,LoginRequest, LoginResponse } from "../types/auth";

export const login = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials,
  );

  return response.data;
};

export const getCurrentUser =
  async (): Promise<CurrentUserResponse> => {
    const response = await api.get<CurrentUserResponse>("/auth/me");

    return response.data;
  };