"use server";

import { ApiResponse } from "shared/types/response";
import { PropertyUser } from "shared/types/modules/identity";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function getPropertyUser(
  jwt: string,
  propertyId: string,
  userId: string,
): ApiResponse<PropertyUser> {
  const response = await fetch(
    `${BACKEND_URL}/properties/${propertyId}/users/${userId}`,
    {
      headers: {
        Authorization: jwt,
      },
      method: "GET",
    },
  );
  return await response.json();
}
