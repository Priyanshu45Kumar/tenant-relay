
import api from "../lib/axios";

import type {
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
} from "../types/apiKey";

export const createApiKey = async (
  data: CreateApiKeyRequest,
): Promise<CreateApiKeyResponse> => {
  const response = await api.post<CreateApiKeyResponse>(
    "/api-keys",
    data,
  );

  return response.data;
};

export const getApiKeys = async (): Promise<ApiKey[]> => {
  const response = await api.get<{
    success: boolean;
    data: ApiKey[];
  }>("/api-keys");

  return response.data.data;
};

export const revokeApiKey = async (
  id: string,
): Promise<void> => {
  await api.patch(`/api-keys/${id}/revoke`);
};