"use server";

import {
  getAllPropertyChildrenPaged,
  getPropertyUser,
} from "@/app/actions/property-management";
import { AdminPropertyChildrenTable } from "@/components/client/AdminPropertyChildrenTable";
import { PROPERTY_USER_ROLE } from "@/data-access-layer/shared/types/property-management";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PropertyAdminPageProps = {
  params: Promise<{ propertyId: string }>;
};

export default async function PropertyAdminPage({
  params,
}: PropertyAdminPageProps) {
  const sessionResponse = await auth.api.getSession({
    headers: await headers(),
    asResponse: true,
  });
  const session = await sessionResponse.json();
  const userId = session?.user?.id || "";
  const jwt = sessionResponse.headers.get("set-auth-jwt") || "";
  const { propertyId } = await params;
  const { data, error } = await getPropertyUser(jwt, propertyId, userId);
  if (error) {
    console.error(error.message);
    return;
  }
  if (data?.role != PROPERTY_USER_ROLE.Admin) {
    redirect(`/dashboard/properties/${propertyId}/admin/403`);
  }

  return (
    <AdminPropertyChildrenTable
      jwt={jwt}
      propertyId={propertyId}
      getAllPropertyChildrenPaged={getAllPropertyChildrenPaged}
    />
  );
}
