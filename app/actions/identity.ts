"use server";

import svc from "@/data-access-layer/modules/identity/svc";
import { auth } from "@/lib/auth";
import { signInSchema } from "@/types/schema";
import { z } from "zod";
import { catchError } from "@/data-access-layer/shared/util/error";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const doesAccountExist = async (
  accountId: string,
): Promise<{ data?: boolean; error?: Error }> => {
  return await svc.doesAccountExist(accountId);
};

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

export const signUp = async () => {
  await auth.api.signUpEmail({
    body: {
      email: "test@test.com",
      password: "password",
      name: "Test User",
    },
  });
};
