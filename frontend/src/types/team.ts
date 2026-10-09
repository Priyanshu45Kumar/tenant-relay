export type TeamMemberRole =
  | "owner"
  | "admin"
  | "developer"
  | "viewer";

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  joinedAt: string;
}

export interface GetTeamMembersResponse {
  success: boolean;
  data: TeamMember[];
}