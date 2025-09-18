"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieJar = await cookies();
  const sessionToken = cookieJar.get("better-auth.session_token");

  if (!sessionToken) return;

  cookieJar.delete(sessionToken);
  redirect("/");
}
