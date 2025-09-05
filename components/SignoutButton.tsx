"use client";
import { authClient } from "@/lib/auth-client";
import React from "react";

export const SignoutButton = () => {
  return <button onClick={() => authClient.signOut()}> Sign Out</button>;
};
