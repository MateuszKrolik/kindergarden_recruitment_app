"use server";

import { DummyForm } from "@/components/client/DummyForm";
import { SignoutButton } from "@/components/client/SignoutButton";
import { signUp } from "@/app/actions/identity";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LoginForm } from "@/components/client/LoginForm";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <main className="flex flex-col items-center justify-center">
      <LoginForm />
      <button onClick={signUp}>Sign up</button>
      <DummyForm />
      <SignoutButton />
      {session ? <div>Authenticated</div> : <div>Unauthenticated</div>}
    </main>
  );
}
