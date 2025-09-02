"use server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/client/LoginForm";
import { getJwtClaims } from "@/util/session";

export default async function AuthForm() {
  console.log(await getJwtClaims());
  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
