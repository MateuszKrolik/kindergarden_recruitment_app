"use server";

import { signInSchema } from "@/types/schemas";
import { redirect } from "next/navigation";
import z from "zod";

export async function signIn(unsafeData: z.infer<typeof signInSchema>) {
  const { success, data } = signInSchema.safeParse(unsafeData);
  const genericErrMessage = "Unable to log you in!";

  if (!success) return genericErrMessage;

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
  } catch {
    return genericErrMessage;
  }

  redirect("/");
}
