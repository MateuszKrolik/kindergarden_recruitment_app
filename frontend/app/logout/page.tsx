"use server";

import Link from "next/link";

export default async function LogoutPage() {
  return (
    <div>
      <h1>You&apos;ve been logged out</h1>
      <p>See you next time 👋</p>
      <Link href="/auth" className="text-blue-600">
        Log back in
      </Link>
    </div>
  );
}
