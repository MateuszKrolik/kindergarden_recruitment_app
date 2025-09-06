"use server";

import {
  getAllProperties,
  getPropertyUser,
} from "@/app/actions/property-management";
import PropertyTable from "@/components/client/PropertiesTable";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function PropertySelectionPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id || "";
  return (
    <PropertyTable
      userId={userId}
      getPropertyUser={getPropertyUser}
      getAllProperties={getAllProperties}
    />
  );
}
