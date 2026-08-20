
import api from "../lib/axios";

import type {
  CreateEventRequest,
  CreateEventResponse,
  GetEventsResponse,
} from "../types/event";

export const createEvent = async (
  data: CreateEventRequest,
): Promise<CreateEventResponse> => {
  const response = await api.post<CreateEventResponse>(
    "/events",
    data,
  );

  return response.data;
};

export const getEvents = async (): Promise<GetEventsResponse> => {
  const response = await api.get<GetEventsResponse>(
    "/events",
  );

  return response.data;
};

