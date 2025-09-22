"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { signInSchema } from "@/types/schema";
import { z } from "zod";
import { catchError } from "@/data-access-layer/shared/util/error";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signIn(
  unsafeData: z.infer<typeof signInSchema>,
): Promise<{ error?: Error } | void> {
  const { success, data, error } = signInSchema.safeParse(unsafeData);

  if (!success) return { error: error };

  const { error: signInError } = await catchError(
    auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
      returnHeaders: true,
    }),
  );

  if (signInError) return { error: signInError };

  revalidatePath("/"); // ensure that server components are re-rendered on success
  redirect(data.callbackUrl || "/dashboard/properties");
}

export async function logoutAction() {
  const cookieJar = await cookies();
  const sessionToken = cookieJar.get("better-auth.session_token");

  if (!sessionToken) return;

  cookieJar.delete(sessionToken);
  redirect("/");
}
