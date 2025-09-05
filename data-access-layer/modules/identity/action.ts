"use server";

import { PgIdentityRepo } from "@/data-access-layer/modules/identity/repo";
import { IdentitySvc } from "@/data-access-layer/modules/identity/svc";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { unstable_cacheTag as cacheTag } from "next/cache";

const repo = new PgIdentityRepo(pool);
const svc = new IdentitySvc(repo);

export const doesAccountExist = async (
  accountId: string,
): Promise<boolean | Error> => {
  "use cache";
  cacheTag(`account:${accountId}:exists`);

  return await svc.doesAccountExist(accountId);
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
