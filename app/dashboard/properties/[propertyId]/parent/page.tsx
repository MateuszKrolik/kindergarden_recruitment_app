"use server";

import {
  getPropertyParentDocumentApprovalRequestByDocumentId,
  getAllDocumentApprovalRequestsForGivenPropertyParent,
  sendPropertyParentDocumentApprovalRequest,
} from "@/app/actions/compliance";
import {
  getPropertyParentDocumentRequirements,
  getPropertyUser,
} from "@/app/actions/property-management";
import { getParentDocumentByType } from "@/app/actions/reporting";
import { PropertyParentPageTabs } from "@/components/client/PropertyParentPageTabs";
import { PropertyUserRole } from "@/data-access-layer/modules/property-management/model";
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id || "";
  const { propertyId } = await params;
  const { data, error } = await getPropertyUser(propertyId, userId);
  if (error) {
    console.error(getErrorMessage(error));
    return;
  }
  if (data?.role != PropertyUserRole.Parent) {
    redirect(`/dashboard/properties/${propertyId}/parent/403`);
  }

  return (
    <PropertyParentPageTabs
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
    />
  );
}
