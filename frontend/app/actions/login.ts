"use server";

import { signInSchema } from "@/types/schemas";
import { getErrorMessage } from "@/util/error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

export async function signIn(
  unsafeData: z.infer<typeof signInSchema>,
): Promise<string> {
  const { success, data, error } = signInSchema.safeParse(unsafeData);

  if (!success) return getErrorMessage(error);

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
      return errMsg;
    }

    const { token } = await response.json();
    const cookieStore = await cookies();

    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 60 * 60, // 2 hrs
    });
  } catch (error) {
    return getErrorMessage(error);
  }

  redirect("/protected");
}
