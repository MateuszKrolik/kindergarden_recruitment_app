"use server";

import { getApiClient } from "@/client";
import { components } from "@/client/schema";
import { ApiResponse } from "@/types/response";

export async function getPropertyUser(
  jwt: string,
  propertyId: string,
  userId: string,
): Promise<ApiResponse<components["schemas"]["PropertyUser"]>> {
  const api = getApiClient(jwt);
  const { data, error } = await api.GET(
    "/properties/{property_id}/users/{user_id}",
    {
      params: { path: { property_id: propertyId, user_id: userId } },
    },
  );
  if (error) return { data: undefined, error: error };
  return { data: data, error: undefined };
}
