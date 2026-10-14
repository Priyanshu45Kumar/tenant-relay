
import api from "../lib/axios";
import type {Workspace, WorkspaceResponse} from "../types/workspace"
export const getCurrentWorkspace = async (): Promise<Workspace> => {
  const response = await api.get<WorkspaceResponse>(
    "/workspace/current",
  );

  return response.data.data;
};

export const updateWorkspace = async (
  data: { name?: string; slug?: string },
): Promise<WorkspaceResponse> => {
  const response = await api.patch<WorkspaceResponse>(
    "/workspace/current",
    data,
  );

  return response.data;
};