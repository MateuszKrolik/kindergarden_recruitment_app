"use server";

import { getAllProperties } from "@/app/actions/properties";
import PropertyTable from "@/components/server/PropertyTable";
import { getAuthHeaders } from "@/util/session";
import { redirect } from "next/navigation";

export default async function PropertiesPage() {
  const authHeader = (await getAuthHeaders()).Authorization;
  if (!authHeader) {
    redirect("/auth/logout");
  }
  const propertyResponse = await getAllProperties(authHeader);
  return (
    <PropertyTable
      data={propertyResponse.data}
      error={propertyResponse.error}
    />
  );
}
