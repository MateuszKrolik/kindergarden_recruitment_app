"use client";

import { useFormStatus } from "react-dom";

export default function LogoutSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`p-4 text-lg`}>
      Logout
    </button>
  );
}
