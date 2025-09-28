"use server";

import { getPropertyUser } from "@/app/actions/identity";
import { PROPERTY_USER_ROLE } from "shared/types/modules/identity";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ propertyId: string; childId: string }>;
};

export default async function Page({ params }: PageProps) {
  const sessionResponse = await auth.api.getSession({
    headers: await headers(),
    asResponse: true,
  });
  const session = await sessionResponse.json();
  const userId = session?.user?.id || "";
  const jwt = sessionResponse.headers.get("set-auth-jwt") || "";
  const { propertyId, childId } = await params;
  const { data, error } = await getPropertyUser(jwt, propertyId, userId);
  if (error) {
    console.error(error.message);
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
