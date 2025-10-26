"use server";

import {
  getPropertyParentDocumentApprovalRequestByDocumentId,
  getAllDocumentApprovalRequestsForGivenPropertyParent,
  sendPropertyParentDocumentApprovalRequest,
  getAllDocumentApprovalRequestsForGivenPropertyChild,
  sendPropertyChildDocumentApprovalRequest,
  getPropertyChildDocumentApprovalRequestByDocumentId,
} from "@/app/actions/compliance";
import {
  getDocumentRequirementsForGivenPropertyChild,
  getPropertyParentDocumentRequirements,
  getPropertyParentPartnerDocumentRequirements,
} from "@/app/actions/property-management";
import { getPropertyUser } from "@/app/actions/identity";
import {
  getChildDocumentByType,
  getDocumentURLByFilePath,
  getParentDocumentByType,
  getParentPartnerDocumentByType,
  saveChildDocument,
  saveParentDocument,
} from "@/app/actions/reporting";
import { PropertyParentPageTabs } from "@/components/client/property/parent/PropertyParentPageTabs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PropertyParentPageProps = {
  params: Promise<{ propertyId: string }>;
};

export default async function PropertyParentPage({
  params,
}: PropertyParentPageProps) {
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
  if (data.role != "parent") {
    redirect(`/dashboard/properties/${propertyId}/parent/403`);
  }

  return (
    <PropertyParentPageTabs
      jwt={jwt}
      propertyId={propertyId}
      userId={userId}
      getParentDocumentByType={getParentDocumentByType}
      getPropertyParentDocumentRequirements={
        getPropertyParentDocumentRequirements
      }
      getAllDocumentApprovalRequestsForGivenPropertyParent={
        getAllDocumentApprovalRequestsForGivenPropertyParent
      }
      getPropertyParentDocumentApprovalRequestByDocumentId={
        getPropertyParentDocumentApprovalRequestByDocumentId
      }
      sendPropertyParentDocumentApprovalRequest={
        sendPropertyParentDocumentApprovalRequest
      }
      saveParentDocument={saveParentDocument}
      getDocumentURLByFilePath={getDocumentURLByFilePath}
      getPropertyChildDocumentRequirements={
        getDocumentRequirementsForGivenPropertyChild
      }
      getAllDocumentApprovalRequestsForGivenPropertyChild={
        getAllDocumentApprovalRequestsForGivenPropertyChild
      }
      getChildDocumentByType={getChildDocumentByType}
      sendPropertyChildDocumentApprovalRequest={
        sendPropertyChildDocumentApprovalRequest
      }
      getPropertyChildDocumentApprovalRequestByDocumentId={
        getPropertyChildDocumentApprovalRequestByDocumentId
      }
      saveChildDocument={saveChildDocument}
      getPropertyParentPartnerDocumentRequirements={
        getPropertyParentPartnerDocumentRequirements
      }
      getParentPartnerDocumentByType={getParentPartnerDocumentByType}
    />
  );
}
