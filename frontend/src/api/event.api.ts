
import api from "../lib/axios";

import type {
  CreateEventRequest,
  CreateEventResponse,
  GetEventsResponse,
} from "../types/event";

export const createEvent = async (
  data: CreateEventRequest,
  apiKey:string
): Promise<CreateEventResponse> => {
  const response = await api.post<CreateEventResponse>(
    "/events",
    data,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  return response.data;
};

export const getEvents = async (): Promise<GetEventsResponse> => {
  const response = await api.get<GetEventsResponse>(
    "/events",
  );

  return response.data;
};

