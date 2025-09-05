"use server";

import { getPropertyUserMe } from "@/app/actions/properties";
import { PropertyUserRole } from "@/types/property";
import { getJwtTokenWithClaims } from "@/util/session";
import { redirect } from "next/navigation";

export default async function PropertyAdminPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { token, claims } = await getJwtTokenWithClaims();
  if (!token || !claims) {
    redirect("/logout");
  }
  const { propertyId } = await params;
  const { data, error } = await getPropertyUserMe(
    token,
    propertyId,
    claims.userId,
  );
  if (error) {
    console.error(error);
    return;
  }
  if (data?.role != PropertyUserRole.Admin) {
    redirect(`/protected/properties/${propertyId}/admin/403`);
  }
  return <div>PropertyAdminPage</div>;
}
