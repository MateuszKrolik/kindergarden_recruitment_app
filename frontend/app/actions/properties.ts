"use server";

import { PropertyResponse } from "@/types/property";
import { getErrorMessage } from "@/util/error";
import { redirect } from "next/navigation";
// import { unstable_cacheTag as cacheTag } from "next/cache";
import { PagedResponse } from "@/types/pagination";

const BASE_URL: string = "http://localhost:8080";

export async function getAllProperties(authHeader: string): Promise<{
  data: PagedResponse<PropertyResponse> | null;
  error: string | null;
}> {
  // "use cache";
  if (!authHeader) {
    redirect("/auth/logout");
  }

  try {
    const response = await fetch(`${BASE_URL}/properties`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    // cacheTag("properties");

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
