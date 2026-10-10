
export interface Event {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface DeliveryStats {
  successful: number;
  failed: number;
  pending: number;
  total: number;
}

export interface GetDeliveryStatsResponse {
  success: boolean;
  data: DeliveryStats;
}


export interface CreateEventRequest {
  type: string;
  payload: Record<string, unknown>;
}

export interface CreateEventResponse {
  success: boolean;
  message: string;
  data: Event;
}

export interface GetEventsResponse {
  success: boolean;
  data: Event[];
}

