"use server";

import { IdentitySvc } from "@/data-access-layer/modules/identity/svc";
import { auth } from "@/lib/auth";
import { unstable_cacheTag as cacheTag } from "next/cache";

const svc = new IdentitySvc();

export const doesAccountExist = async (
  accountId: string,
): Promise<{ data?: boolean; error?: Error }> => {
  "use cache";
  cacheTag(`account:${accountId}:exists`);

  return await svc.doesAccountExist(accountId);
};

export const signIn = async () => {
  await auth.api.signInEmail({
    body: {
      email: "test@test.com",
      password: "password",
    },
  });
};

export const signUp = async () => {
  await auth.api.signUpEmail({
    body: {
      email: "test@test.com",
      password: "password",
      name: "Test User",
    },
  });
};
