"use server";

import {
  approvePropertyChildDocumentApprovalRequest,
  approvePropertyParentDocumentApprovalRequest,
  approvePropertyParentPartnerDocumentApprovalRequest,
  getAllDocumentApprovalRequestsForGivenPropertyChild,
  getAllDocumentApprovalRequestsForGivenPropertyParent,
  getAllDocumentApprovalRequestsForGivenPropertyParentPartner,
} from "@/app/actions/compliance";
import { getPropertyUser } from "@/app/actions/identity";
import {
  getChildDocumentURLByDocumentID,
  getParentDocumentURLByDocumentID,
  getParentPartnerDocumentURLByDocumentID,
} from "@/app/actions/reporting";
import { AdminPropertyChildTabs } from "@/components/client/property/admin/child/AdminPropertyChildTabs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ propertyId: string; parentId: string; childId: string }>;
};

export default async function Page({ params }: PageProps) {
  const sessionResponse = await auth.api.getSession({
    headers: await headers(),
    asResponse: true,
  });
  const session = await sessionResponse.json();
  const userId = session?.user?.id || "";
  const jwt = sessionResponse.headers.get("set-auth-jwt") || "";
  const { propertyId, parentId, childId } = await params;
  const { data, error } = await getPropertyUser(jwt, propertyId, userId);
  if (error) {
    console.error(error.message);
    return;
  }
  if (data.role != "admin") {
    redirect(`/dashboard/properties/${propertyId}/admin/403`);
  }

  return (
    <AdminPropertyChildTabs
      jwt={jwt}
      userId={userId}
      propertyId={propertyId}
      parentId={parentId}
      childId={childId}
      getAllDocumentApprovalRequestsForGivenPropertyChild={
        getAllDocumentApprovalRequestsForGivenPropertyChild
      }
      getAllDocumentApprovalRequestsForGivenPropertyParent={
        getAllDocumentApprovalRequestsForGivenPropertyParent
      }
      getAllDocumentApprovalRequestsForGivenPropertyParentPartner={
        getAllDocumentApprovalRequestsForGivenPropertyParentPartner
      }
      approvePropertyChildDocumentApprovalRequest={
        approvePropertyChildDocumentApprovalRequest
      }
      getChildDocumentURLByDocumentID={getChildDocumentURLByDocumentID}
      approvePropertyParentDocumentApprovalRequest={
        approvePropertyParentDocumentApprovalRequest
      }
      getParentDocumentURLByDocumentID={getParentDocumentURLByDocumentID}
      approvePropertyParentPartnerDocumentApprovalRequest={
        approvePropertyParentPartnerDocumentApprovalRequest
      }
      getParentPartnerDocumentURLByDocumentID={
        getParentPartnerDocumentURLByDocumentID
      }
    />
  );
}
