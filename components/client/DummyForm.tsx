"use client";

import { doesAccountExist } from "@/app/actions/identity";
import { getErrorMessage } from "@/util/error";
import { toast } from "sonner";

export const DummyForm = () => {
  return (
    <form
      action={async (formData: FormData) => {
        const accountId = formData.get("accountId") as string;
        const { data: exists, error } = await doesAccountExist(accountId);
        if (error) {
          toast.error(getErrorMessage(error));
          return;
        }
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
