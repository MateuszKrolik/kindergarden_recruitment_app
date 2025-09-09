"use server";

import { IdentitySvc } from "@/data-access-layer/modules/identity/svc";
import { auth } from "@/lib/auth";
import { signInSchema } from "@/types/schema";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { z } from "zod";
import { catchError } from "@/data-access-layer/shared/util/error";

const svc = new IdentitySvc();

export const doesAccountExist = async (
  accountId: string,
): Promise<{ data?: boolean; error?: Error }> => {
  "use cache";
  cacheTag(`account:${accountId}:exists`);

  return await svc.doesAccountExist(accountId);
};

export async function signIn(
  unsafeData: z.infer<typeof signInSchema>,
): Promise<{ headers?: Headers; error?: Error }> {
  const { success, data, error } = signInSchema.safeParse(unsafeData);

  if (!success) return { headers: undefined, error: error };

  const { data: signInData, error: signInError } = await catchError(
    auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
      returnHeaders: true,
    }),
  );

  if (signInError) return { headers: undefined, error: signInError };

  return {
    headers: signInData?.headers,
    error: undefined,
  };
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
