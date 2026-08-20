import api from "../lib/axios";
import type { CreateWebhookRequest, CreateWebhookResponse, } from "../types/webhook";

export const createWebhook = async ( data: CreateWebhookRequest, ): Promise<CreateWebhookResponse> => { const response = await api.post<CreateWebhookResponse>( "/webhooks", data, ); return response.data; }; 