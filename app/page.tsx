"use server";

import { SignoutButton } from "@/components/SignoutButton";
import { auth } from "@/lib/auth";
import { signIn, signUp } from "@/server-actions/identity";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(session);
  return (
    <main className="flex flex-col items-center justify-center">
      <button onClick={signIn}>Sign in </button>
      <button onClick={signUp}>Sign up</button>
      <SignoutButton />
      {session ? <div>Authenticated</div> : <div>Unauthenticated</div>}
    </main>
  );
}
