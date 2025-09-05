"use server";

import { DummyForm } from "@/components/client/DummyForm";
import { SignoutButton } from "@/components/client/SignoutButton";
import { signIn, signUp } from "@/data-access-layer/modules/identity/action";
import { auth } from "@/lib/auth";
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
      <DummyForm />
      <SignoutButton />
      {session ? <div>Authenticated</div> : <div>Unauthenticated</div>}
    </main>
  );
}
