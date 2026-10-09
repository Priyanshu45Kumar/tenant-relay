import api from "../lib/axios";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  tenantName: string;
  invitationToken?: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expiresInSeconds: number;
    resendAvailableInSeconds: number;
  };
}

export const requestRegistrationOtp = async (
  data: RegisterRequest,
): Promise<RequestOtpResponse> => {
  const response = await api.post<RequestOtpResponse>(
    "/auth/register/request-otp",
    data,
  );

  return response.data;
};

export interface VerifyRegistrationOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyRegistrationOtpResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    expiresInSeconds: number;
    user: {
      id: string;
      name: string;
      email: string;
    };
    tenant: {
      id: string;
      name: string;
      slug: string;
    };
    role: "owner" | "admin" | "developer" | "viewer";
  };
}

export const verifyRegistrationOtp = async (
  data: VerifyRegistrationOtpRequest,
): Promise<VerifyRegistrationOtpResponse> => {
  const response = await api.post<VerifyRegistrationOtpResponse>(
    "/auth/register/verify-otp",
    data,
  );

  return response.data;
};