"use server";

import { Property, PropertyUser } from "@/types/property";
import { getErrorMessage } from "@/util/error";
import { redirect } from "next/navigation";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { PagedResponse } from "@/types/pagination";
import { getJwtTokenWithClaims } from "@/util/session";

const BASE_URL: string = "http://localhost:8080";

export async function getAllPropertiesTableAction(
  pageNumber: number,
  pageSize: number,
) {
  const { token } = await getJwtTokenWithClaims();
  if (!token) {
    redirect("/logout");
  }
  return await getAllProperties(token, pageNumber, pageSize);
}

async function getAllProperties(
  token: string,
  pageNumber: number,
  pageSize: number,
): Promise<{
  data: PagedResponse<Property> | null;
  error: string | null;
}> {
  "use cache";
  try {
    const response = await fetch(
      `${BASE_URL}/properties?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      },
    );

    cacheTag("properties");

    if (!response.ok) {
      const errMsg = await response.text();
      return { data: null, error: errMsg };
    }

    const data = await response.json();
    console.log(data);
    return { data: data, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: getErrorMessage(error) };
  }
}

export async function getPropertyUserMeMenuAction(
  propertyId: string,
): Promise<{ data: PropertyUser | null; error: string | null }> {
  const { token, claims } = await getJwtTokenWithClaims();
  if (!token || !claims) {
    redirect("/logout");
  }
  return await getPropertyUserMe(token, propertyId, claims.userId);
}

export async function getPropertyUserMe(
  token: string,
  propertyId: string,
  userId: string,
): Promise<{ data: PropertyUser | null; error: string | null }> {
  "use cache";
  try {
    const response = await fetch(
      `${BASE_URL}/properties/${propertyId}/users/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      },
    );

    cacheTag(`property:${propertyId}:user:${userId}`);

    if (!response.ok) {
      const errMsg = await response.text();
      return { data: null, error: errMsg };
    }

    const data = await response.json();
    console.log(data);
    return { data: data, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: getErrorMessage(error) };
  }
}
