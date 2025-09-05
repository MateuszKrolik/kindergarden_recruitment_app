"use server";

import { getJwtTokenWithClaims } from "@/util/session";
import { redirect } from "next/navigation";

export default async function ParentDetailsPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { token, claims } = await getJwtTokenWithClaims();
  if (!token || !claims) {
    redirect("/logout");
  }
  const { propertyId } = await params;
  console.log(propertyId);
  return <div>ParentDetailsPage</div>;
}
