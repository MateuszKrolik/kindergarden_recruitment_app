"use server";

import {
  getPropertyParentDocumentApprovalRequestByDocumentId,
  getAllDocumentApprovalRequestsForGivenPropertyParent,
  sendPropertyParentDocumentApprovalRequest,
} from "@/app/actions/compliance";
import {
  getDocumentRequirementsForGivenPropertyChild,
  getPropertyParentDocumentRequirements,
  getPropertyUser,
} from "@/app/actions/property-management";
import {
  getDocumentURLByFilePath,
  getParentDocumentByType,
  saveParentDocument,
} from "@/app/actions/reporting";
import { PropertyParentPageTabs } from "@/components/client/PropertyParentPageTabs";
import { PROPERTY_USER_ROLE } from "@/data-access-layer/shared/types/property-management";
import { auth } from "@/lib/auth";
import { getErrorMessage } from "@/util/error";
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
    console.error(getErrorMessage(error));
    return;
  }
  if (data?.role != PROPERTY_USER_ROLE.Parent) {
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
    />
  );
}
