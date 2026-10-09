import api from "../lib/axios";

import type {
  GetTeamMembersResponse,
} from "../types/team";

export const getTeamMembers =
  async (): Promise<GetTeamMembersResponse> => {
    const response =
      await api.get<GetTeamMembersResponse>("/team");

    return response.data;
  };
  export interface CreateTeamInvitationRequest {
  email: string;
  role: "admin" | "developer" | "viewer";
}

export interface CreateTeamInvitationResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    role: "admin" | "developer" | "viewer";
    expiresAt: string;
  };
}

export const createTeamInvitation = async (
  data: CreateTeamInvitationRequest,
): Promise<CreateTeamInvitationResponse> => {
  const response =
    await api.post<CreateTeamInvitationResponse>(
      "/team/invite",
      data,
    );

  return response.data;
};
export interface AcceptTeamInvitationRequest {
  token: string;
}

export interface AcceptTeamInvitationResponse {
  success: boolean;
  message: string;
  data: {
    tenantId: string;
    role: "owner" | "admin" | "developer" | "viewer";
  };
}

export const acceptTeamInvitation = async (
  data: AcceptTeamInvitationRequest,
): Promise<AcceptTeamInvitationResponse> => {
  const response =
    await api.post<AcceptTeamInvitationResponse>(
      "/team/invitations/accept",
      data,
    );

  return response.data;
};