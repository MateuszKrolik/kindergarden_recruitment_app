"use server";

import { PostgresIdentityHandler } from "@/data-access-layer/modules/identity/handler";
import { auth } from "@/lib/auth";
import { unstable_cacheTag as cacheTag } from "next/cache";

const h = new PostgresIdentityHandler();

export const doesAccountExist = async (
  accountId: string,
): Promise<boolean | Error> => {
  "use cache";
  cacheTag(`account:${accountId}:exists`);

  return await h.svc.doesAccountExist(accountId);
};

export const signIn = async () => {
  await auth.api.signInEmail({
    body: {
      email: "test1@test.com",
      password: "password",
    },
  });
};

export const signUp = async () => {
  await auth.api.signUpEmail({
    body: {
      email: "test1@test.com",
      password: "password",
      name: "Testing Tester",
    },
  });
};
