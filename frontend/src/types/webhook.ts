
export interface CreateWebhookRequest {
  name: string;
  url: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookResponse {
  success: boolean;
  message: string;
  data: WebhookEndpoint;
}

export interface GetWebhooksResponse {
  success: boolean;
  data: WebhookEndpoint[];
}
export interface RevokeWebhookResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    url: string;
    active: boolean;
  };
}

