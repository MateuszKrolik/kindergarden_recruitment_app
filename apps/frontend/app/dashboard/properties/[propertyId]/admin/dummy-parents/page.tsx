"use server";

import {
  getAllDocumentApprovalRequestsForGivenProperty,
  approvePropertyParentDocumentApprovalRequest,
} from "@/app/actions/compliance";
import { getPropertyUser } from "@/app/actions/identity";
import { getParentDocumentURLByDocumentID } from "@/app/actions/reporting";
import AdminPropertyParentDocumentTable from "@/components/client/property/admin/parent/approvals/AdminPropertyParentDocumentTable";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ propertyId: string }>;
};

export default async function Page({ params }: PageProps) {
  const sessionResponse = await auth.api.getSession({
    headers: await headers(),
    asResponse: true,
  });
  const session = await sessionResponse.json();
  const userId = session?.user?.id || "";
  const jwt = sessionResponse.headers.get("set-auth-jwt") || "";
  const { propertyId } = await params;
  const { data, error } = await getPropertyUser(jwt, propertyId, userId);
  if (error) {
    console.error(error.message);
    return;
  }
  if (data.role != "admin") {
    redirect(`/dashboard/properties/${propertyId}/admin/403`);
  }

  return (
    <AdminPropertyParentDocumentTable
      jwt={jwt}
      propertyId={propertyId}
      adminId={userId}
      getAllDocumentApprovalRequestsForGivenProperty={
        getAllDocumentApprovalRequestsForGivenProperty
      }
      approvePropertyParentDocumentApprovalRequest={
        approvePropertyParentDocumentApprovalRequest
      }
      getParentDocumentURLByDocumentID={getParentDocumentURLByDocumentID}
    />
  );
}
