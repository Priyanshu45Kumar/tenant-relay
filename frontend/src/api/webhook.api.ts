import api from "../lib/axios";
import type { CreateWebhookRequest, CreateWebhookResponse, GetWebhooksResponse,RevokeWebhookResponse } from "../types/webhook";

export const createWebhook = async ( data: CreateWebhookRequest, ): Promise<CreateWebhookResponse> => { const response = await api.post<CreateWebhookResponse>( "/webhooks", data, ); return response.data; };

export const getWebhookEndpoints = async (): Promise<GetWebhooksResponse> => {
  const response = await api.get<GetWebhooksResponse>("/webhooks");

  return response.data;
};

export const deactivateWebhook = async (
  id: string,
): Promise<RevokeWebhookResponse> => {
  const response = await api.patch<RevokeWebhookResponse>(
    `/webhooks/${id}/deactivate`,
  );

  return response.data;
};