"use server";

import { getJwtClaims } from "@/util/session";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const claims = await getJwtClaims();
  if (!claims) {
    redirect("/auth/logout");
  }
  return <div>Super secret page!</div>;
}
