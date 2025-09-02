"use server";

import { signInSchema } from "@/types/schemas";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

type SignInResponse = {
  error?: string;
};

export async function signIn(
  unsafeData: z.infer<typeof signInSchema>,
): Promise<SignInResponse> {
  const { success, data } = signInSchema.safeParse(unsafeData);
  const genericErrMessage = "Unable to log you in!";

  if (!success) return { error: genericErrMessage };

  try {
    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!response.ok) {
      const errMsg = await response.text();
      return { error: errMsg };
    }

    const { token } = await response.json();
    const cookieStore = await cookies();

    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 60 * 60, // 2 hrs
    });
  } catch {
    return { error: genericErrMessage };
  }

  redirect("/protected");
}
