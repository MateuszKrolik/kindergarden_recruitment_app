"use client";
import { signIn } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRef } from "react";
import LoginSubmitButton from "./LoginSubmitButton";
import { toast } from "sonner";
import { getErrorMessage } from "@/util/error";
import { useSearchParams } from "next/navigation";

export const LoginForm = () => {
  const ref = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") || "/dashboard/properties";
  return (
    <form
      className="w-full"
      ref={ref}
      action={async (formData) => {
        const result = await signIn({
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          callbackUrl,
        });
        if (result && result.error) toast.error(getErrorMessage(result.error));
      }}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            className="w-full"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            className="w-full"
          />
        </div>
        <LoginSubmitButton />
      </div>
    </form>
  );
};
