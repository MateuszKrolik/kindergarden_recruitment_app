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
  REQUEST_STATUS,
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
  getParentDocumentURLByDocumentID(
    docId: string,
  ): Promise<{ data?: string; error?: Error }>;
};

export default function AdminPropertyParentDocumentTableActionMenu({
  adminId,
  request,
  setPropertyParentDocumentApprovalRequestStatus,
  getParentDocumentURLByDocumentID,
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
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            const { data, error } = await getParentDocumentURLByDocumentID(
              request.parent_document_id,
            );
            if (error) {
              toast.error(getErrorMessage(error));
              return;
            }
            window.open(data, "_blank");
          }}
        >
          View document
        </DropdownMenuItem>
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
};

const SetStatusDropdownMenuItem = ({
  adminId,
  request,
  setPropertyParentDocumentApprovalRequestStatus,
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
    toast.success(`Request ${status} successfuly!`);
  };
  switch (request.request_status) {
    case REQUEST_STATUS.PENDING:
      return (
        <>
          <DropdownMenuItem
            onClick={async () =>
              await handleStatusChange(REQUEST_STATUS.APPROVED)
            }
          >
            Approve Request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () =>
              await handleStatusChange(REQUEST_STATUS.REJECTED)
            }
          >
            Reject Request
          </DropdownMenuItem>
        </>
      );
    case REQUEST_STATUS.APPROVED:
      return (
        <>
          <DropdownMenuItem disabled>Approve Request</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Reject Request</DropdownMenuItem>
        </>
      );
    case REQUEST_STATUS.REJECTED:
      return (
        <>
          <DropdownMenuItem
            onClick={async () =>
              await handleStatusChange(REQUEST_STATUS.APPROVED)
            }
          >
            Approve Request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Reject Request</DropdownMenuItem>
        </>
      );
    default:
      return null;
  }
};
