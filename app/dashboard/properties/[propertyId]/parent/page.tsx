"use server";

import {
  getPropertyParentDocumentApprovalRequestByDocumentId,
  getPropertyParentDocumentApprovalRequests,
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
  const result = await getPropertyUser(propertyId, userId);
  if (result instanceof Error) {
    console.error(getErrorMessage(result));
    return;
  }
  if (result?.role != PropertyUserRole.Parent) {
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
      getPropertyParentDocumentApprovalRequests={
        getPropertyParentDocumentApprovalRequests
      }
      getPropertyParentDocumentApprovalRequestByDocumentId={
        getPropertyParentDocumentApprovalRequestByDocumentId
      }
    />
  );
}
