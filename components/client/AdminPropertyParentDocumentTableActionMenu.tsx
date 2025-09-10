import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  PropertyParentDocument,
  RequestStatus,
} from "@/data-access-layer/modules/compliance/model";
import { toast } from "sonner";
import { getErrorMessage } from "@/util/error";

type AdminPropertyParentDocumentTableActionMenuProps = {
  adminId: string;
  request: PropertyParentDocument;
  setPropertyParentDocumentApprovalRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
    adminId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag(
    propertyId: string,
  ): Promise<void>;
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag(
    propertyId: string,
    userId: string,
  ): Promise<void>;
  revalidateGetPropertyParentDocumentApprovalRequestCacheTag(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<void>;
};

export default function AdminPropertyParentDocumentTableActionMenu({
  adminId,
  request,
  setPropertyParentDocumentApprovalRequestStatus,
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag,
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag,
  revalidateGetPropertyParentDocumentApprovalRequestCacheTag,
}: AdminPropertyParentDocumentTableActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <SetStatusDropdownMenuItem
          adminId={adminId}
          request={request}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type SetStatusDropdownMenuItemProps = {
  adminId: string;
  request: PropertyParentDocument;
  setPropertyParentDocumentApprovalRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
    adminId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag(
    propertyId: string,
  ): Promise<void>;
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag(
    propertyId: string,
    userId: string,
  ): Promise<void>;
  revalidateGetPropertyParentDocumentApprovalRequestCacheTag(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<void>;
};

const SetStatusDropdownMenuItem = ({
  adminId,
  request,
  setPropertyParentDocumentApprovalRequestStatus,
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag,
  revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag,
  revalidateGetPropertyParentDocumentApprovalRequestCacheTag,
}: SetStatusDropdownMenuItemProps) => {
  const handleStatusChange = async (status: RequestStatus) => {
    const { error } = await setPropertyParentDocumentApprovalRequestStatus(
      request.property_id,
      request.user_id,
      request.parent_document_id,
      status,
      adminId,
    );
    if (error) {
      toast.error(getErrorMessage(error));
      return;
    }
    await revalidateGetAllDocumentApprovalRequestsForGivenPropertyCacheTag(
      request.property_id,
    );
    await revalidateGetAllDocumentApprovalRequestsForGivenPropertyParentCacheTag(
      request.property_id,
      request.user_id,
    );
    await revalidateGetPropertyParentDocumentApprovalRequestCacheTag(
      request.property_id,
      request.user_id,
      request.parent_document_id,
    );
    toast.success(`Request ${status} successfuly!`);
  };
  switch (request.request_status) {
    case RequestStatus.PendingStatus:
      return (
        <>
          <DropdownMenuItem
            onClick={async () =>
              await handleStatusChange(RequestStatus.ApprovedStatus)
            }
          >
            Approve Request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () =>
              await handleStatusChange(RequestStatus.RejectedStatus)
            }
          >
            Reject Request
          </DropdownMenuItem>
        </>
      );
    case RequestStatus.ApprovedStatus:
      return (
        <>
          <DropdownMenuItem
            disabled
            onClick={async () =>
              await handleStatusChange(RequestStatus.ApprovedStatus)
            }
          >
            Approve Request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled
            onClick={async () =>
              await handleStatusChange(RequestStatus.ApprovedStatus)
            }
          >
            Reject Request
          </DropdownMenuItem>
        </>
      );
    case RequestStatus.RejectedStatus:
      return (
        <>
          <DropdownMenuItem
            onClick={async () =>
              await handleStatusChange(RequestStatus.ApprovedStatus)
            }
          >
            Approve Request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled
            onClick={async () =>
              await handleStatusChange(RequestStatus.ApprovedStatus)
            }
          >
            Reject Request
          </DropdownMenuItem>
        </>
      );
    default:
      return null;
  }
};
