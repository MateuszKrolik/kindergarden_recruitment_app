"use server";
import AuthForm from "@/components/server/AuthForm";
import React from "react";

export default async function AuthPage() {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return <AuthForm />;
}
