
export type DeliveryStatus = "success" | "failed";

export interface DeliveryRecord {
  _id: string;
  status: DeliveryStatus;
  attempts: number;
  responseStatus?: number;
  lastError?: string;
  deliveredAt?: string;
  createdAt: string;
  eventId: {
    _id: string;
    type: string;
    createdAt: string;
  } | null;
  webhookEndpointId: {
    _id: string;
    name: string;
    url: string;
  } | null;
}

export interface GetDeliveriesResponse {
  success: boolean;
  data: DeliveryRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

