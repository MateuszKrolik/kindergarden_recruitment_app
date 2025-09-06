"use server";

import { getPropertyUser } from "@/app/actions/property-management";
import { PropertyUserRole } from "@/data-access-layer/modules/property-management/model";
import { auth } from "@/lib/auth";
import { getErrorMessage } from "@/util/error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PropertyParentPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id || "";
  const { propertyId } = await params;
  const result = await getPropertyUser(propertyId, userId);
  if (result instanceof Error) {
    console.error(getErrorMessage(result));
    return;
  }
  if (result?.role != PropertyUserRole.Parent) {
    redirect(`/dashboard/properties/${propertyId}/parent/403`);
  }
  return <div>PropertyParentPage</div>;
}
