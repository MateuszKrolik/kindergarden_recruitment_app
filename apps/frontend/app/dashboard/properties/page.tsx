"use server";

import { getAllProperties } from "@/app/actions/property-management";
import { getPropertyUser } from "@/app/actions/identity";
import PropertyTable from "@/components/client/PropertiesTable";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function PropertySelectionPage() {
  const sessionResponse = await auth.api.getSession({
    headers: await headers(),
    asResponse: true,
  });
  const session = await sessionResponse.json();
  const userId = session?.user?.id || "";
  const jwt = sessionResponse.headers.get("set-auth-jwt") || "";
  return (
    <PropertyTable
      jwt={jwt}
      userId={userId}
      getPropertyUser={getPropertyUser}
      getAllProperties={getAllProperties}
    />
  );
}
