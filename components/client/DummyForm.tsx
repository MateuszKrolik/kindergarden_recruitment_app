"use client";

import { doesAccountExist } from "@/app/actions/identity";
import { getErrorMessage } from "@/util/error";
import { toast } from "sonner";

export const DummyForm = () => {
  return (
    <form
      action={async (formData: FormData) => {
        const accountId = formData.get("accountId") as string;
        const result = await doesAccountExist(accountId);
        if (result instanceof Error) {
          toast.error(getErrorMessage(result));
          return;
        }
        const exists = result as boolean;
        toast(
          `Account with id: ${accountId} ${exists ? "exists!" : "does not exist!"}`,
        );
      }}
    >
      <input
        name="accountId"
        type="text"
        placeholder="Enter account ID"
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
};
