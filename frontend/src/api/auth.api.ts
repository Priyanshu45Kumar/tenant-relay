import api from "../lib/axios";
import type { UpdatePasswordRequest,UpdatePasswordResponse,CurrentUserResponse,LoginRequest, LoginResponse } from "../types/auth";

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
  
  export const updatePassword = async (
  data: UpdatePasswordRequest,
): Promise<UpdatePasswordResponse> => {
  const response = await api.patch<UpdatePasswordResponse>(
    "/auth/change-password",
    data,
  );

  return response.data;
};