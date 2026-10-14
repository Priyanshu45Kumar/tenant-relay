
import api from "../lib/axios";
import type {
  DeliveryStatus,
  GetDeliveriesResponse,
} from "../types/delivery";

export const getDeliveries = async (
  status: DeliveryStatus,
  page = 1,
  limit = 10,
): Promise<GetDeliveriesResponse> => {
  const response = await api.get<GetDeliveriesResponse>(
    "/deliveries",
    {
      params: { status, page, limit },
    },
  );

  return response.data;
};

export const replayDelivery = async (deliveryId: string) => {
  const response = await api.post(
    `/deliveries/${deliveryId}/replay`,
  );

  return response.data;
};

