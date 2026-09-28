
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  active: boolean;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
}

export interface CreateApiKeyResponse {
  message: string;
  apiKey: string;
  data: ApiKey;
}
