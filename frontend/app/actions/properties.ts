"use server";

import { Property } from "@/types/property";
import { getErrorMessage } from "@/util/error";
import { redirect } from "next/navigation";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { PagedResponse } from "@/types/pagination";
import { getAuthHeaders } from "@/util/session";

const BASE_URL: string = "http://localhost:8080";

export async function getAllPropertiesTableAction(
  pageNumber: number,
  pageSize: number,
) {
  const authHeader = (await getAuthHeaders()).Authorization;
  if (!authHeader) {
    redirect("/auth/logout");
  }
  return await getAllProperties(authHeader, pageNumber, pageSize);
}

async function getAllProperties(
  authHeader: string,
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
          Authorization: authHeader,
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
