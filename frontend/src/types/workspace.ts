export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role?: string | null;
  createdAt: string;
}

export interface WorkspaceResponse {
  success: boolean;
  message?: string;
  data: Workspace;
}