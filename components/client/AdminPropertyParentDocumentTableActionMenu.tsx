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
  request: PropertyParentDocument;
  setPropertyParentDocumentApprovalRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
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
  request: PropertyParentDocument;
  setPropertyParentDocumentApprovalRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
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
            onClick={() => handleStatusChange(RequestStatus.ApprovedStatus)}
          >
            Approve Request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleStatusChange(RequestStatus.RejectedStatus)}
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
            onClick={() => handleStatusChange(RequestStatus.ApprovedStatus)}
          >
            Approve Request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled
            onClick={() => handleStatusChange(RequestStatus.ApprovedStatus)}
          >
            Reject Request
          </DropdownMenuItem>
        </>
      );
    case RequestStatus.RejectedStatus:
      return (
        <>
          <DropdownMenuItem
            onClick={() => handleStatusChange(RequestStatus.ApprovedStatus)}
          >
            Approve Request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled
            onClick={() => handleStatusChange(RequestStatus.ApprovedStatus)}
          >
            Reject Request
          </DropdownMenuItem>
        </>
      );
    default:
      console.log("Request object:", request);
      console.log("Request status:", request.request_status, RequestStatus);
      return <h1>WTF</h1>;
  }
};
