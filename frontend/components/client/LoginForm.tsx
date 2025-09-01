"use client";
import { signIn } from "@/actions/login";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React, { useRef } from "react";
import LoginSubmitButton from "./LoginSubmitButton";

export const LoginForm = () => {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <div>
      <form
        ref={ref}
        action={async (formData) => {
          const errMsg = await signIn({
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          });
          if (errMsg) {
            alert(errMsg);
          }
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
            />
          </div>
          <LoginSubmitButton />
        </div>
      </form>
    </div>
  );
};
