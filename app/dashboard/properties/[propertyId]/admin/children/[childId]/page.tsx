"use server";

import { getPropertyUser } from "@/app/actions/property-management";
import { PROPERTY_USER_ROLE } from "@/data-access-layer/modules/property-management/model";
import { auth } from "@/lib/auth";
import { getErrorMessage } from "@/util/error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ propertyId: string; childId: string }>;
};

export default async function Page({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id || "";
  const { propertyId, childId } = await params;
  const { data, error } = await getPropertyUser(propertyId, userId);
  if (error) {
    console.error(getErrorMessage(error));
    return;
  }
  if (data?.role != PROPERTY_USER_ROLE.Admin) {
    redirect(`/dashboard/properties/${propertyId}/admin/403`);
  }
  return (
    <div>
      <h1>Property ID: {propertyId}</h1>
      <h1>Child ID: {childId}</h1>
    </div>
  );
}
