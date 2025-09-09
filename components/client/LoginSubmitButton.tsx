import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export default function LoginSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit">
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}
