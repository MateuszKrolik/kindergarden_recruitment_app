"use server";

import {
  getAllDocumentApprovalRequestsForGivenProperty,
  setPropertyParentDocumentApprovalRequestStatus,
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag,
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag,
  revalidateGetPropertyParentDocumentApprovalRequestCacheTag,
} from "@/app/actions/compliance";
import { getPropertyUser } from "@/app/actions/property-management";
import AdminPropertyParentDocumentTable from "@/components/client/AdminPropertyParentDocumentTable";
import { PropertyUserRole } from "@/data-access-layer/modules/property-management/model";
import { auth } from "@/lib/auth";
import { getErrorMessage } from "@/util/error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PropertyAdminPageProps = {
  params: Promise<{ propertyId: string }>;
};

export default async function PropertyAdminPage({
  params,
}: PropertyAdminPageProps) {
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
  if (data?.role != PropertyUserRole.Admin) {
    redirect(`/dashboard/properties/${propertyId}/admin/403`);
  }

  return (
    <AdminPropertyParentDocumentTable
      propertyId={propertyId}
      adminId={userId}
      getAllDocumentApprovalRequestsForGivenProperty={
        getAllDocumentApprovalRequestsForGivenProperty
      }
      setPropertyParentDocumentApprovalRequestStatus={
        setPropertyParentDocumentApprovalRequestStatus
      }
      revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag={
        revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag
      }
      revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag={
        revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag
      }
      revalidateGetPropertyParentDocumentApprovalRequestCacheTag={
        revalidateGetPropertyParentDocumentApprovalRequestCacheTag
      }
    />
  );
}
