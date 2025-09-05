"use server";

import { getJwtTokenWithClaims } from "@/util/session";
import { redirect } from "next/navigation";

export default async function ForbiddenPage() {
  const { token, claims } = await getJwtTokenWithClaims();
  if (!token || !claims) {
    redirect("/logout");
  }
  return (
    <div>You don&apos;t have required permissions to access this page!</div>
  );
}
