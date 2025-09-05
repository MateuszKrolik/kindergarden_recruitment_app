"use client";
import { authClient } from "@/lib/auth-client";

export const SignoutButton = () => {
  return <button onClick={() => authClient.signOut()}> Sign Out</button>;
};
