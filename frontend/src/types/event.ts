
export interface Event {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
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

